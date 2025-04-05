const request = require("supertest");
const app = require("../app");  // Импортируем приложение Express

describe("API routes tests", () => {
  it("should login successfully", async () => {
    const response = await request(app)
      .post("/login")
      .send({ username: "admin", password: "password123" });

    expect(response.status).toBe(302); // Ожидаем редирект
    expect(response.header.location).toBe("/admin");
  });

  it("should return 401 for invalid login", async () => {
    const response = await request(app)
      .post("/login")
      .send({ username: "admin", password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.text).toBe("Неверный логин или пароль");
  });

  it("should upload image", async () => {
    const loginResponse = await request(app)
        .post("/login")
        .send({ username: "admin", password: "password123" })

    const token = loginResponse.header["set-cookie"].find(cookie =>
        cookie.startsWith("token=")
    ).split(";")[0].split("=")[1];

    const response = await request(app)
        .post("/upload")
        .set("Cookie", `token=${token}`)
        .attach("image", "/Users/user/projects/katrin-site/tests/static/image.jpg")
        .field("category", "Wedding Dresses")
        .field("caption", "Uploaded image");

    expect(response.status).toBe(302); // Ожидаем редирект
    expect(response.header.location).toBe("/admin");
  });

  it("should not upload non-image file", async () => {
      const loginResponse = await request(app)
          .post("/login")
          .send({ username: "admin", password: "password123" })

      const token = loginResponse.header["set-cookie"].find(cookie =>
          cookie.startsWith("token=")
      ).split(";")[0].split("=")[1];


    const response = await request(app)
        .post("/upload")
        .set("Cookie", `token=${token}`)
        .attach("image", "/Users/user/projects/katrin-site/tests/static/non_image.txt")
        .field("category", "landscape")
        .field("caption", "Invalid file");

    expect(response.status).toBe(400); // Ожидаем ошибку
  });
});
