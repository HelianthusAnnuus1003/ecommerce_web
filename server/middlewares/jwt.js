const jwt = require("jsonwebtoken");

// Access Token
const generateAccessToken = (uid, role) => {
    return jwt.sign({ _id: uid, role }, process.env.JWT_TOKEN, {
        expiresIn: "2d",
    });
};

// Refresh Token
const generateRefreshToken = (uid) => {
    return jwt.sign({ _id: uid }, process.env.JWT_TOKEN, {
        expiresIn: "7d",
    });
};

module.exports = { generateAccessToken, generateRefreshToken };
