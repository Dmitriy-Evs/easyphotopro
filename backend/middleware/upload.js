const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Конфигурация хранилища Multer для сохранения файлов на сервере
const storage = multer.diskStorage({
  // Определяем папку назначения для каждого файла
  destination: function (req, file, cb) {
    // Получаем event_id из тела запроса
    const eventId = req.body.event_id;

    // Проверяем, был ли передан event_id
    if (!eventId) {
      // Если event_id отсутствует, возвращаем ошибку и прекращаем загрузку
      return cb(new Error('Event ID is required'), false);
    }

    // Создаем путь для директории, используя event_id как имя папки
    const dir = path.join('uploads', eventId);

    // Используем fs.mkdirSync для создания директории, если она еще не существует
    // Опция recursive: true позволяет создать промежуточные папки, если они отсутствуют
    fs.mkdirSync(dir, { recursive: true });

    // Если директория создана или уже существует, передаем путь для сохранения файлов
    cb(null, dir);
  },
  // Определяем имя файла
  filename: function (req, file, cb) {
    // Присваиваем файлу уникальное имя, используя текущую дату/время и расширение оригинального файла
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Функция фильтрации файлов, разрешающая загрузку только изображений
const fileFilter = (req, file, cb) => {
  // Проверяем, начинается ли MIME-тип файла с "image/" (например, image/jpeg, image/png)
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Разрешаем загрузку файла
  } else {
    // Если файл не является изображением, возвращаем ошибку
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Настройка и инициализация Multer с заданными ограничениями и конфигурацией
const upload = multer({
  storage: storage, // Используем конфигурацию хранения, определенную выше
  limits: { fileSize: 20 * 1024 * 1024 }, // Ограничиваем размер файла до 20MB
  fileFilter: fileFilter // Применяем фильтрацию файлов для разрешения загрузки только изображений
}).array('photos', 100); // Указываем поле запроса для загрузки ("photos") и ограничиваем количество файлов до 100

module.exports = upload;
