const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Получение токена из заголовка Authorization
  const token = req.header('Authorization');

  // Проверка, существует ли токен
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    // Извлечение токена после слова "Bearer"
    const splitToken = token.split(' ');
    if (splitToken[0] !== 'Bearer' || !splitToken[1]) {
      return res.status(401).json({ msg: 'Invalid token format' });
    }

    // Декодирование токена
    const decoded = jwt.verify(splitToken[1], process.env.JWT_SECRET);
    req.user = decoded; // Добавление данных пользователя в объект запроса
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
