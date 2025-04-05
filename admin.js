const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

// Функция для создания базы данных
function createDatabase(dbPath = 'db.sqlite') {
  const db = new sqlite3.Database(dbPath);

  // Функция для создания таблиц
  function createTables(database) {
    return new Promise((resolve, reject) => {
      database.run(`
        CREATE TABLE IF NOT EXISTS gallery_test (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT,
          category TEXT,
          caption TEXT,
          draft BOOLEAN DEFAULT 0
        )
      `, (err1) => {
        if (err1) return reject(err1);
        
        database.run(`
          CREATE TABLE IF NOT EXISTS admins_test (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'moderator'))
          )
        `, (err2) => {
          if (err2) reject(err2);
          else resolve();
        });
      });
    });
  }

  // Инициализация таблиц при создании базы данных
  createTables(db);

  // Функции остаются прежними, но принимают базу данных в качестве параметра
  function getPublishedGallery(database = db) {
    database = db
    return new Promise((resolve, reject) => {
      database.all("SELECT * FROM gallery_test WHERE draft = 0", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  function getAllGallery(database = db) {
    return new Promise((resolve, reject) => {
      database = db
      database.all("SELECT * FROM gallery_test", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  function addImage(filename, category, caption, database = db) {
    database = db
    return new Promise((resolve, reject) => {
      database.run(
        "INSERT INTO gallery_test (filename, category, caption, draft) VALUES (?, ?, ?, ?)",
        [filename, category, caption, 1],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  function publishGallery(database = db) {
    database = db
    return new Promise((resolve, reject) => {
      database.run("UPDATE gallery_test SET draft = 0", (err) => (err ? reject(err) : resolve()));
    });
  }

  function updateImage(id, category, caption, database = db) {
    database = db
    return new Promise((resolve, reject) => {
      database.run(
        "UPDATE gallery_test SET category = ?, caption = ? WHERE id = ?",
        [category, caption, id],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  function deleteImage(id, database = db) {
    database = db
    return new Promise((resolve, reject) => {
      database.get("SELECT filename FROM gallery_test WHERE id = ?", [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        database.run("DELETE FROM gallery_test WHERE id = ?", [id], (err) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    });
  }

  function setDraft(id, database = db) {
    database = db
    return new Promise((resolve, reject) => {
      database.run("UPDATE gallery_test SET draft = 1 WHERE id = ?", [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  function getAdmin(username, database = db) {
    database = db
    return new Promise((resolve, reject) => {
      database.get("SELECT * FROM admins_test WHERE username = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  async function addAdmin(username, password, role = "moderator", database = db) {
    database = db
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      database.run("INSERT INTO admins_test (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  return {
    db,
    createTables,
    getPublishedGallery,
    getAllGallery,
    addImage,
    publishGallery,
    updateImage,
    deleteImage,
    setDraft,
    getAdmin,
    addAdmin
  };
}

module.exports = createDatabase();
module.exports.createDatabase = createDatabase;