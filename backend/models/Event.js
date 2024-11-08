const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  event_name: { type: String, required: true },
  event_date: { type: Date, required: true },
  user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Event', EventSchema);
