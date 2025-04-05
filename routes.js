const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { getPublishedGallery, setDraft, getAllGallery, addImage, publishGallery, updateImage, deleteImage } = require("./admin");
const { getAdmin, addAdmin } = require("./admin");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/roleMiddleware");
const upload = require("./upload");


const router = express.Router();

// Отображение админ-панели
router.get("/admin", authMiddleware, async (req, res) => {
    const gallery = await getAllGallery(true); // Показываем черновики и опубликованные фото
    const user = await getAdmin(req.cookies.user)
    res.render("admin", { gallery, user });
});

// Обновление информации о фото
router.post("/edit", authMiddleware, async (req, res) => {
    const { id, category, caption } = req.body;
    await updateImage(id, category, caption);
    res.redirect("/admin");
});

// Удаление фото
router.post("/delete", authMiddleware, async (req, res) => {
    const { id } = req.body;
    const image = await deleteImage(id);
    if (image) {
        const filePath = path.join(__dirname, "static", image.filename);
        fs.unlink(filePath, (err) => {
            if (err) console.error("Ошибка удаления файла:", err);
        });
    }
    res.redirect("/admin");
});

// Публикация галереи
router.post("/publish", authMiddleware, async (req, res) => {
    await publishGallery();
    res.redirect("/admin");
});

router.post("/set-draft", authMiddleware, async (req, res) => {
    const { id } = req.body;
    await setDraft(id);
    res.redirect("/admin");
  });

// **Защита загрузки фото (для admin и moderator)**
router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Ошибка загрузки файла.");
    }
    try {
        await addImage(req.file.filename, req.body.category, req.body.caption);
        res.redirect("/admin");
    } catch (error) {
        console.error("Ошибка при сохранении в БД:", error);
        res.status(500).send("Ошибка сервера.");
    }
});

// **Эндпоинт для создания модератора (доступен только admin)**
router.post("/create-moderator", authMiddleware, adminMiddleware, async (req, res) => {
    const { username, password } = req.body;

    try {
        await addAdmin(username, password, "moderator");
        res.json({ success: true, message: "Модератор добавлен!" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании модератора" });
    }
});

// Предпросмотр
router.get("/preview", authMiddleware, async (req, res) => {
    const gallery = await getAllGallery(true); // true - брать из черновика
    res.render("preview", { gallery });
});

module.exports = router;
