const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName)
        return res.status(400).json({
            success: false,
            message: "Missing required input",
        });

    const userExists = await User.findOne({ email });
    if (userExists) throw new Error("User has extisted");
    else {
        const response = await User.create(req.body);
        return res.status(200).json({
            success: response ? true : false,
            message: response
                ? "Register is successfully"
                : "Something went wrong",
        });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({
            success: false,
            message: "Missing required input",
        });

    // login check login có 2 phần
    // phần 1: check email đã được đăng ký hay chưa
    // phần 2: check password có đúng hay không
    const response = await User.findOne({ email });
    // Vì thằng findOne trả về instance của mongodb nên cần phải dùng toObject() để chuyển nó thành object mới đọc được

    if (response && (await response.isCorrectPassword(password))) {
        const { password, role, ...userData } = response.toObject();
        return res.status(200).json({
            success: true,
            userData,
        });
    } else {
        throw new Error("Login failed! :<");
    }
});

module.exports = {
    register,
    login,
};
