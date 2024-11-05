const multer = require('multer');
const path = require('path');

// Устанавливаем хранилище для файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Папка для сохранения загруженных файлов
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
  }
});

// Проверка типа файла (допустим только изображения)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Настройка Multer с ограничениями
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // Ограничение на размер файла: 20MB
  },
  fileFilter: fileFilter
}).array('photos', 100); // Ограничение на количество файлов: не более 100

module.exports = upload;
