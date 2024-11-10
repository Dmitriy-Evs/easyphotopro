const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Email пользователя для связи и отправки ссылки
  photo_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true }], // Массив с ID выбранных фотографий
  order_sum: { type: Number, required: true },
  count_photo: { type: Number, required: true },
  download_link: { type: String, default: null }, // Ссылка для скачивания, создается после оплаты
  payed: { type: Number, required: true, default: 1 } // 1 — не оплачен, 2 — оплачен
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);