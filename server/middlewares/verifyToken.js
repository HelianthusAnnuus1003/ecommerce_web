const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    // header: { authorization: 'Bearer jqwkflwklfwkfljqwkfljwklf'}
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        // Token có dạng là: "Bearer fkjjqjfqkwlf1542kjkljflqwf" nên là tách thằng Bearer ra
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_TOKEN, (err, decode) => {
            if (err)
                return res.status(401).json({
                    success: false,
                    message: "Invalid access token",
                });
            req.user = decode;
            next();
        });
    } else {
        return res.status(401).json({
            success: false,
            message: "Can't find access token, please authentication!",
        });
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { role } = req.user;
    if (role !== "admin")
        return res.status(401).json({
            success: false,
            message: "You require admin permission!",
        });
    next();
});

module.exports = {
    verifyAccessToken,
    isAdmin,
};
