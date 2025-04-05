const { addAdmin } = require("./admin");

(async () => {
    await addAdmin("admin", "password123", "admin");
    console.log("Главный админ добавлен!");
})();
