function adminMiddleware(req, res, next) {
    if (req.admin.role !== "admin") {
        return res.status(403).send("Доступ запрещен");
    }
    next();
}

module.exports = adminMiddleware;
