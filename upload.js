const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Настройка хранилища файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "static")); // Убеждаемся, что путь корректный
    },
    filename: function (req, file, cb) {
        const filename = uuidv4() + path.extname(file.originalname);
        cb(null, filename);
    }
});

// Фильтр для проверки файлов (только изображения)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Только изображения!"), false);
    }
};

module.exports = multer({ storage, fileFilter });
