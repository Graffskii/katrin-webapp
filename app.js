require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const { getAdmin, addAdmin } = require("./admin");
const { getPublishedGallery, getAllGallery, addImage } = require("./admin");
const { generateToken } = require("./generateToken");
const bcrypt = require("bcrypt");



const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/static", express.static("static"));
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: "supersecretkey",
        resave: false,
        saveUninitialized: true,
    })
);
app.use(express.json());  // Разбирает JSON-тело запроса
app.use(express.urlencoded({ extended: true }));  // Разбирает данные из form-data
app.use(cookieParser());



// Главная страница
app.get("/", async (req, res) => {
    const gallery = await getPublishedGallery();
    res.render("index", { gallery });
});

// **Страница входа**
app.get("/login", (req, res) => {
    res.render("login");
});

// **Обработка входа**
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const admin = await getAdmin(username);

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).send("Неверный логин или пароль");
    }

    const token = generateToken(admin);
    res.cookie("token", token, { httpOnly: true });
    res.cookie("user", username, {httpOnly: true})
    res.redirect("/admin");
});

// **Выход**
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});


// Обработка формы записи
app.post("/contact", (req, res) => {
    const { name, number, message } = req.body;
    console.log(req.body)
    let http = require('request')
    let msg = `Имя: ${name}\nТелефон: ${number}\nСообщение: ${message}`
    console.log(msg)
    msg = encodeURI(msg)

    http.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHATID}&parse_mode=html&text=${msg}`,
    function (error, response, body) {  
        console.log('error:', error); 
        console.log('statusCode:', response && response.statusCode); 
        console.log('body:', body); 
        if(response.statusCode===200){
            res.json({ success: true });
        }
        if(response.statusCode!==200){
            res.status(400)
        }
      });
});

// Админка
app.use("/admin", require("./routes"));

if (process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

module.exports = app;
