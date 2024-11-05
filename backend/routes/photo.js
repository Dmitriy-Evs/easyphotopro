const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Импорт Mongoose
const router = express.Router();
const Event = require('../models/Event');
const Photo = require('../models/Photo'); // Импорт модели Photo
const auth = require('../middleware/auth'); // Импорт middleware для защиты маршрутов
const upload = require('../middleware/upload'); // Импорт Multer middleware

// @route   POST /api/photos
// @desc    Загрузка фотографий (пока без полной логики загрузки)
// @access  Private (только фотографы и админы)
router.post('/', auth, (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
  
      // Проверка наличия файлов
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: 'No files uploaded' });
      }
  
      try {
        const { event_id } = req.body;
        const user_id = req.user.id;
        const existingPhotoNames = new Set(); // Сет для хранения оригинальных имен существующих фотографий
        const skippedPhotos = []; // Массив для хранения имен пропущенных фотографий
  
        // Получаем все существующие фотографии в данном событии от данного фотографа
        const existingPhotos = await Photo.find({ event_id, user_id });
        existingPhotos.forEach(photo => existingPhotoNames.add(photo.originalName));
  
        // Фильтруем новые фотографии, которые уже существуют
        const photosToSave = req.files.filter(file => {
          if (existingPhotoNames.has(file.originalname)) {
            skippedPhotos.push(file.originalname);
            return false; // Пропускаем загрузку этой фотографии
          }
          return true; // Фотография новая, добавляем в сохранение
        });
  
        // Сохранение новых фотографий в базе данных
        const photos = photosToSave.map(file => ({
          event_id,
          user_id,
          url: path.posix.join('uploads', path.basename(file.path)), // Нормализуем путь с прямыми слэшами
          originalName: file.originalname
        }));
        const savedPhotos = await Photo.insertMany(photos);
  
        // Обновляем событие, добавляя user_id фотографа в список user_ids (если его там еще нет)
        await Event.findByIdAndUpdate(
          event_id,
          { $addToSet: { user_ids: user_id } }, // $addToSet добавляет user_id, если его еще нет
          { new: true }
        );
  
        // Формируем ответ с информацией о загруженных и пропущенных фотографиях
        res.status(201).json({
          savedPhotos,
          skippedPhotosCount: skippedPhotos.length,
          skippedPhotos
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  });

// @route   GET /api/photos/event/:eventId
// @desc    Получение всех фотографий для события
// @access  Public
router.get('/event/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const photos = await Photo.find({ event_id: eventId });
      res.json(photos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

// @route   GET /api/photos/event/:eventId/photographer/:userId
// @desc    Получение всех фотографий фотографа в рамках одного события
// @access  Public
router.get('/event/:eventId/photographer/:userId', async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const photos = await Photo.find({ event_id: eventId, user_id: userId });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/photos/event/:eventId
// @desc    Удаление фотографий в рамках одного события (список id в теле запроса)
// @access  Private (только фотографы и админы)
router.delete('/event/:eventId', auth, async (req, res) => {
    try {
      const { eventId } = req.params;
      const { photoIds } = req.body;
  
      // Проверка на наличие photoIds и их тип
      if (!photoIds || !Array.isArray(photoIds)) {
        return res.status(400).json({ msg: 'Photo IDs must be provided as an array' });
      }
  
      // Фильтрация корректных ObjectId
      const validPhotoIds = photoIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validPhotoIds.length === 0) {
        return res.status(400).json({ msg: 'No valid photo IDs provided' });
      }
  
      // Проверка роли пользователя
      if (req.user.role !== 'admin' && req.user.role !== 'photographer') {
        return res.status(403).json({ msg: 'Access denied' });
      }
  
      // Находим фотографии, которые нужно удалить, внутри одного события
      const photosToDelete = await Photo.find({ _id: { $in: validPhotoIds }, event_id: eventId });
  
      if (req.user.role === 'photographer') {
        // Фотограф может удалить только свои фотографии
        const ownedPhotos = photosToDelete.filter(photo => photo.user_id.toString() === req.user.id);
        if (ownedPhotos.length === 0) {
          return res.status(403).json({ msg: 'No photos found that you have permission to delete' });
        }
  
        // Удаляем только фотографии, принадлежащие фотографу
        await Photo.deleteMany({ _id: { $in: ownedPhotos.map(photo => photo._id) } });
      } else if (req.user.role === 'admin') {
        // Админ может удалить все указанные фотографии
        await Photo.deleteMany({ _id: { $in: validPhotoIds }, event_id: eventId });
      }
  
      res.status(200).json({ msg: 'Photos removed successfully' }); // Возвращаем успешный ответ с кодом 200
    } catch (err) {
      res.status(500).json({ error: err.message }); // Обрабатываем ошибки и возвращаем ответ с кодом 500
    }
  });

module.exports = router;
