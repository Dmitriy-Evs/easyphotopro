const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_sum: { type: Number, required: true },
  count_photo: { type: Number, required: true },
  download_link: { type: String, required: true },
  payed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Order', orderSchema);
