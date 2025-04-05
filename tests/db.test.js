const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const { createDatabase } = require('../admin'); // Замените на путь к вашему файлу

describe('Database Functions', () => {
  let db, dbMethods;

  beforeAll(async () => {
    // Открываем временную базу данных в памяти для тестов
    const tempDb = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });

    // Создаем базу данных с временной базой
    dbMethods = createDatabase(':memory:');
    db = dbMethods.db;

    await dbMethods.createTables(db);
  });

  afterAll(async () => {
    // Закрываем базу данных после тестов
    await db.close();
  });

  describe('Gallery Image Functions', () => {
    beforeEach(async () => {
        // Очищаем таблицу перед каждым тестом
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM gallery_test', (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

    test('addImage should add a new image to the gallery', async () => {
      await dbMethods.addImage('test.jpg', 'Wedding Dresses', 'Beautiful landscape');
      const images = await dbMethods.getAllGallery();
      
      expect(images.length).toBe(1);
      expect(images[0].filename).toBe('test.jpg');
      expect(images[0].category).toBe('Wedding Dresses');
      expect(images[0].caption).toBe('Beautiful landscape');
      expect(images[0].draft).toBe(1);
    });

    test('getPublishedGallery should return only published images', async () => {
      // Добавляем несколько изображений
      await dbMethods.addImage('published1.jpg', 'Wedding Dresses', 'Landscape 1');
      await dbMethods.addImage('draft.jpg', 'Wedding Dresses', 'City view');
      await dbMethods.publishGallery(); // Публикуем все изображения

      const publishedImages = await dbMethods.getPublishedGallery();
      
      expect(publishedImages.length).toBe(2);
      expect(publishedImages.every(img => img.draft === 0)).toBe(true);
    });

    test('updateImage should modify image details', async () => {
      await dbMethods.addImage('original.jpg', 'Wedding Dresses', 'Initial caption');
      const images = await dbMethods.getAllGallery();
      const imageId = images[0].id;

      await dbMethods.updateImage(imageId, 'Wedding Dresses', 'Updated caption');
      const updatedImages = await dbMethods.getAllGallery();

      expect(updatedImages[0].category).toBe('Wedding Dresses');
      expect(updatedImages[0].caption).toBe('Updated caption');
    });

    test('deleteImage should remove an image', async () => {
      await dbMethods.addImage('delete.jpg', 'Wedding Dresses', 'To be deleted');
      const images = await dbMethods.getAllGallery();
      const imageId = images[0].id;

      const deletedImage = await dbMethods.deleteImage(imageId);
      
      expect(deletedImage.filename).toBe('delete.jpg');
      
      const remainingImages = await dbMethods.getAllGallery();
      expect(remainingImages.length).toBe(0);
    });

    test('setDraft should mark image as draft', async () => {
      await dbMethods.addImage('draft.jpg', 'Wedding Dresses', 'Draft image');
      const images = await dbMethods.getAllGallery();
      const imageId = images[0].id;

      await dbMethods.publishGallery(); // Сначала публикуем
      await dbMethods.setDraft(imageId); // Затем переводим в черновик

      const updatedImages = await dbMethods.getAllGallery();
      expect(updatedImages[0].draft).toBe(1);
    });
  });

  describe('Admin Functions', () => {
    beforeEach(async () => {
      // Очищаем таблицу администраторов перед каждым тестом
      await db.run('DELETE FROM admins_test');
    });

    test('addAdmin should create a new admin with hashed password', async () => {
      await dbMethods.addAdmin('testuser', 'password123');
      const admin = await dbMethods.getAdmin('testuser');

      expect(admin).toBeTruthy();
      expect(admin.username).toBe('testuser');
      expect(await bcrypt.compare('password123', admin.password)).toBe(true);
      expect(admin.role).toBe('moderator');
    });

    test('addAdmin should support creating admin with specific role', async () => {
      await dbMethods.addAdmin('adminuser', 'adminpass', 'admin');
      const admin = await dbMethods.getAdmin('adminuser');

      expect(admin.role).toBe('admin');
    });

    test('getAdmin should return null for non-existent user', async () => {
      const admin = await dbMethods.getAdmin('nonexistent');
      expect(admin).toBeUndefined();
    });
  });
});