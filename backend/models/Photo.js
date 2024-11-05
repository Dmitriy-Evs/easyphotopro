const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  originalName: { type: String, required: true } // Добавляем поле для хранения оригинального имени
});

module.exports = mongoose.model('Photo', PhotoSchema);
