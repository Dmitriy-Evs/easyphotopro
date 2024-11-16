const express = require('express');
const path = require('path')
const router = express.Router();
const Order = require('../models/Order'); // Импорт модели Order
const Photo = require('../models/Photo'); // Импорт модели Photo
const axios = require('axios');
const fs = require('fs');
const archiver = require('archiver');
//Мок сервер для отправки оплаты
const MOCK_SERVER_URL = 'https://7710faf5-fa8d-4a7b-bf9e-6c94e595fd3c.mock.pstmn.io/pay';

// @route   POST /api/orders
// @desc    Создание нового заказа
// @access  Public (доступен для всех, без аутентификации)
router.post('/', async (req, res) => {
  try {
    const { photoIds, order_sum, email } = req.body;

    // Проверка обязательных полей
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ msg: 'Photo IDs must be provided as a non-empty array' });
    }
    if (!order_sum || typeof order_sum !== 'number' || order_sum <= 0) {
      return res.status(400).json({ msg: 'A valid order sum must be provided' });
    }
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ msg: 'A valid email must be provided' });
    }

    // Проверка существования всех указанных фотографий в базе данных
    const photos = await Photo.find({ _id: { $in: photoIds } });

    if (photos.length !== photoIds.length) {
      return res.status(404).json({ msg: 'One or more photos do not exist' });
    }

    // Создание записи заказа
    const newOrder = new Order({
      email,
      photo_ids: photoIds,
      order_sum,
      count_photo: photos.length,
      payed: 1 // Статус по умолчанию — не оплачен
    });

    // Сохранение заказа в базе данных
    const savedOrder = await newOrder.save();

    res.status(201).json({
      msg: 'Order created successfully',
      order: savedOrder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/orders/:orderId/confirm
// @desc    Подтверждение оплаты и генерация ссылки для скачивания
// @access  Public (вызывается через webhook от провайдера оплаты)
router.post('/:orderId/confirm', async (req, res) => {
    try {
      const { orderId } = req.params;
  
      // Поиск заказа по ID
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
  
      // Проверка статуса оплаты
      if (order.payed === 2) {
        return res.status(400).json({ msg: 'Order is already paid' });
      }
  
      // Обновление статуса на "оплачен"
      order.payed = 2;
  
      // Генерация ссылки для скачивания
      const downloadLink = `http://localhost:5000/api/orders/${order._id}/download`;
      order.download_link = downloadLink;
  
      // Сохранение изменений в заказе
      await order.save();
  
      // Отправка ссылки на почту пользователя
      // Для отправки email можно использовать Nodemailer или другой сервис
      // Здесь приводится пример без фактической отправки
      console.log(`Email sent to ${order.email} with download link: ${downloadLink}`);
  
      res.status(200).json({
        msg: 'Order confirmed and download link sent to user',
        downloadLink
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/:orderId/pay', async (req, res) => {
    const { orderId } = req.params;
  
    try {
      // Поиск заказа по ID
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
  
      // Проверка статуса заказа
      if (order.payed === 2) {
        return res.status(400).json({ msg: 'Order is already paid' });
      }
  
      // Отправка запроса на мок-сервер для подтверждения оплаты
      const response = await axios.post(MOCK_SERVER_URL);
  
      // Проверка ответа от мок-сервера
      if (response.data && response.data.status === 'success') {
        // Обновляем статус заказа на "Оплачен"
        order.payed = 2;
  
        // Генерация ссылки для скачивания
        const downloadLink = `http://localhost:5000/api/orders/${order._id}/download`;
        order.download_link = downloadLink;
  
        // Сохранение изменений в заказе
        await order.save();
  
        // Логирование информации о почте и ссылке для скачивания
        console.log(`Download link for order ${order._id} sent to ${order.email}: ${downloadLink}`);
  
        // Отправляем успешный ответ
        res.status(200).json({
          msg: 'Payment successful, order confirmed, and download link logged',
          downloadLink
        });
      } else {
        // Если ответ от мок-сервера не содержит статус "success"
        res.status(500).json({ msg: 'Payment failed or was not confirmed' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:orderId/download', async (req, res) => {
    const { orderId } = req.params;
  
    try {
      // Поиск заказа по ID
      const order = await Order.findById(orderId).populate('photo_ids');
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
  
      // Проверка статуса оплаты
      if (order.payed !== 2) {
        return res.status(403).json({ msg: 'Order has not been paid' });
      }
  
      // Настраиваем имя архива
      const archiveName = `order_${order._id}.zip`;
  
      // Устанавливаем заголовки для скачивания архива
      res.setHeader('Content-Disposition', `attachment; filename=${archiveName}`);
      res.setHeader('Content-Type', 'application/zip');
  
      // Создаем архив и поток для отправки
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });
  
      archive.pipe(res);
  
      // Добавляем фотографии в архив
      for (const photo of order.photo_ids) {
        const filePath = path.join(__dirname, '..', photo.url);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: path.basename(photo.url) });
        } else {
          console.error(`File not found: ${filePath}`);
        }
      }
  
      // Завершаем архивирование и отправку
      archive.finalize();
  
      // Обработка ошибок архивации
      archive.on('error', (err) => {
        res.status(500).json({ error: err.message });
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
