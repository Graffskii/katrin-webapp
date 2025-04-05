const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/roleMiddleware");
const jwt = require("jsonwebtoken");
const { response, request } = require("express");

jest.mock("jsonwebtoken");

describe("Middleware tests", () => {
  it("should call next if token is valid", () => {
    const req = {
      cookies: {
        token: "valid-token"
      }
    };
    const res = {};
    const next = jest.fn();
    
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { role: "admin" });
    });

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should redirect if token is missing", () => {
    const req = {
      cookies: {}
    };
    const res = {
      redirect: jest.fn()
    };
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });

  it("should deny access if role is not admin", () => {
    const req = {
      admin: {
        role: "moderator"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    const next = jest.fn();

    adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith("Доступ запрещен");
  });

  it("should allow access if role is admin", () => {
    const req = {
      admin: {
        role: "admin"
      }
    };
    const res = {};
    const next = jest.fn();

    adminMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
