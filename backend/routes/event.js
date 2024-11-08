const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); // Импорт модели Event
const auth = require('../middleware/auth'); // Импорт middleware для защиты маршрутов

// @route   POST /api/events
// @desc    Создание нового события (доступно только администраторам)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    // Проверка роли пользователя
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { event_name, event_date } = req.body;

    // Создание нового события
    const newEvent = new Event({
      event_name,
      event_date,
      user_ids: [] // Пустой список пользователей, так как фотографы будут добавлять фотографии позже
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/events
// @desc    Получение списка всех событий
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/events/:id
// @desc    Получение информации об одном событии
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Обновление события (доступно только администраторам)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Проверка роли пользователя
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { event_name, event_date } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    // Обновление информации о событии
    if (event_name) event.event_name = event_name;
    if (event_date) event.event_date = event_date;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Удаление события (доступно только администраторам)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Проверка роли пользователя
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const event = await Event.findByIdAndDelete(req.params.id); // Используем findByIdAndDelete

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    res.json({ msg: 'Event removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
