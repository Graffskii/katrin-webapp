const jwt = require("jsonwebtoken");

function generateToken(admin) {
    return jwt.sign(
        { username: admin.username, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

module.exports = { generateToken };
