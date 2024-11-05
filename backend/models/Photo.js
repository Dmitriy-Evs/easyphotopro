const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true } // URL of the photo
});

module.exports = mongoose.model('Photo', photoSchema);
