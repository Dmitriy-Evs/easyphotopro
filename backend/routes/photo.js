const fs = require('fs');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Импорт Mongoose
const router = express.Router();
const Event = require('../models/Event');
const Photo = require('../models/Photo'); // Импорт модели Photo
const User = require('../models/User');
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    try {
      const { event_id } = req.body;
      const user_id = req.user.id;
      const existingPhotoNames = new Set();
      const skippedPhotos = [];

      // Получаем существующие фотографии для проверки дубликатов
      const existingPhotos = await Photo.find({ event_id, user_id });
      existingPhotos.forEach(photo => existingPhotoNames.add(photo.originalName));

      // Фильтрация для загрузки только новых фотографий
      const photosToSave = req.files.filter(file => {
        if (existingPhotoNames.has(file.originalname)) {
          skippedPhotos.push(file.originalname);
          return false;
        }
        return true;
      });

      const photos = photosToSave.map(file => ({
        event_id,
        user_id,
        url: file.path.replace(/\\/g, '/'), // Прямые слэши в пути
        originalName: file.originalname
      }));
      const savedPhotos = await Photo.insertMany(photos);

      // Обновляем событие с user_id
      await Event.findByIdAndUpdate(
        event_id,
        { $addToSet: { user_ids: user_id } },
        { new: true }
      );

      // Обновляем пользователя с event_id
      await User.findByIdAndUpdate(
        user_id,
        { $addToSet: { events_ids: event_id } },
        { new: true }
      );

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
router.delete('/', auth, async (req, res) => {
  try {
    const { photoIds } = req.body;

    if (!photoIds || !Array.isArray(photoIds)) {
      return res.status(400).json({ msg: 'Photo IDs must be provided as an array' });
    }

    const validPhotoIds = photoIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validPhotoIds.length === 0) {
      return res.status(400).json({ msg: 'No valid photo IDs provided' });
    }

    let photosToDelete;

    if (req.user.role === 'admin') {
      // Админ может удалять любые фотографии
      photosToDelete = await Photo.find({ _id: { $in: validPhotoIds } });
    } else if (req.user.role === 'photographer') {
      // Фотограф может удалять только свои фотографии
      photosToDelete = await Photo.find({ _id: { $in: validPhotoIds }, user_id: req.user.id });
    } else {
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (photosToDelete.length === 0) {
      return res.status(404).json({ msg: 'No photos found for deletion' });
    }

    const successfulDeletes = [];
    const missingFiles = [];

    for (const photo of photosToDelete) {
      const filePath = path.resolve(photo.url);
      const fileExists = fs.existsSync(filePath);

      if (fileExists) {
        fs.unlink(filePath, err => {
          if (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
            missingFiles.push(photo.originalName || filePath); // Логируем имя, если удаление файла не удалось
          }
        });
      } else {
        missingFiles.push(photo.originalName || photo.url); // Логируем, что файл не найден на сервере
      }

      successfulDeletes.push(photo._id); // Логируем успешное удаление из базы данных
    }

    // Удаление фотографий из базы данных
    await Photo.deleteMany({ _id: { $in: successfulDeletes } });

    res.status(200).json({
      msg: 'Photos removed successfully',
      deletedFromDB: successfulDeletes.length,
      missingFilesCount: missingFiles.length,
      missingFiles
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
