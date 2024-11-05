const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['photographer', 'client'], default: 'client' },
  password: { type: String, default: null }, // Password only required for photographers
  registration_date: { type: Date, default: Date.now },
  event_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] // List of event IDs
});

module.exports = mongoose.model('User', userSchema);
