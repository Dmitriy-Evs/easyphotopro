const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Регистрация фотографа
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Проверка, существует ли пользователь
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Создание нового пользователя
    user = new User({
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role: 'photographer'
    });

    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Авторизация фотографа или админа
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Найти пользователя по email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Проверка роли пользователя
      if (user.role !== 'photographer' && user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
      }
  
      // Проверка пароля
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Генерация токена JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  module.exports = router;
