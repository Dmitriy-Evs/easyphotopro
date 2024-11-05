const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  event_name: { type: String, required: true },
  event_date: { type: Date, default: null },
  user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // List of user IDs who uploaded photos
});

module.exports = mongoose.model('Event', eventSchema);
