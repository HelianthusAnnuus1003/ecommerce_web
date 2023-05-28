const User = require("../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../ultils/sendMail");
const asyncHandler = require("express-async-handler");
const {
    generateAccessToken,
    generateRefreshToken,
} = require("../middlewares/jwt");

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

// Refresh Token => Cấp mới access token
// Access token => Xác thực và phân quyền người dùng (Authentication and Authorization)
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
        // Tách password và role ra khỏi response
        const { password, role, refreshToken, ...userData } =
            response.toObject();
        // Tạo access token
        const accessToken = generateAccessToken(response._id, role);
        // Tạo refresh token
        const newRefreshToken = generateRefreshToken(response._id);

        // Lưu refresh token vào db
        await User.findByIdAndUpdate(
            response._id,
            { refreshToken: newRefreshToken },
            { new: true }
        );

        // Lưu refresh token vào cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // chuyển đổi 7 ngày thành miliseconds ^^
        });

        return res.status(200).json({
            success: true,
            accessToken,
            userData,
        });
    } else {
        throw new Error("Login failed! :<");
    }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Lấy cookie ra
    const cookie = req.cookies;

    // Kiểm tra trong cookie có refreshtoken chưa
    if (!cookie && !cookie.refreshToken)
        throw new Error("No refresh token in cookie");

    // Kiểm tra refreshToken trong cookie vừa lấy ra có hợp lệ ko
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_TOKEN);
    const response = await User.findOne({
        _id: rs._id,
        refreshToken: cookie.refreshToken,
    });
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response
            ? generateAccessToken(response._id, response.role)
            : "Refresh token not matches!",
    });
});

const logout = asyncHandler(async (req, res) => {
    // Lấy cookie ra
    const cookie = req.cookies;

    // Kiểm tra trong cookie có refreshtoken chưa
    if (!cookie || !cookie.refreshToken)
        throw new Error("No refresh token in cookie");

    // Tìm thằng user nào có cái refreshtoken trùng với refreshToken trong cookie và xóa refreshToken ở DB
    await User.findOneAndUpdate(
        { refreshToken: cookie.refreshToken },
        { refreshToken: "" },
        { new: true }
    );

    // Tìm thằng user nào có cái refreshtoken trùng với refreshToken trong cookie và xóa refreshToken ở cookie trình duyệt
    res.clearCookie("refreshToken", {
        httpOnly: true,
        success: true,
    });

    return res.status(200).json({
        success: true,
        message: "Logout successfully!",
    });
});

// Reset password
// client gui yeu cau va gui email cua minh len server
// server check email co hop le hay khong => gui email va kem theo link (password change token)
// client check mail => click link
// client gui api kem token
// check token co giong voi token ma server gui mail hay khong
// change password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email) throw new Error("Missing email");
    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found");
    const resetToken = user.createChangePasswordToken();

    await user.save();

    const html = `Please click the link below to change your password. This link will expire in 15 minutes starting now. <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`;

    const data = {
        email,
        html,
    };

    const rs = await sendEmail(data);
    return res.status(200).json({
        success: true,
        rs,
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;

    if (!password || !token) throw new Error("Missing input");

    const passwordResetToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new Error("Invalid reset password token");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({
        success: user ? true : false,
        message: user
            ? "Password changed successfully"
            : "Something went wrong",
    });
});

// =============== API USER ================
const getUserById = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const userCurrent = await User.findById(_id).select(
        "-refreshToken -role -password"
    );
    return res.status(200).json({
        success: userCurrent ? true : false,
        response: userCurrent ? userCurrent : "User not found!",
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const response = await User.find().select("-refreshToken -role -password");

    return res.status(200).json({
        success: response ? true : false,
        users: response,
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.query;
    if (!_id) throw new Error("Missing input");

    const response = await User.findByIdAndDelete(_id);

    return res.status(200).json({
        success: response ? true : false,
        deletedUser: response
            ? `User with email ${response.email} deleted successfully`
            : "Delete user failed!",
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    if (!_id || Object.keys(req.body).length === 0)
        throw new Error("Missing input");

    const response = await User.findByIdAndUpdate(_id, req.body, {
        new: true,
    }).select("-role -password -refreshToken");

    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : "Update user failed!",
    });
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error("Missing input");

    const response = await User.findByIdAndUpdate(uid, req.body, {
        new: true,
    }).select("-role -password -refreshToken");

    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : "Update user failed!",
    });
});

module.exports = {
    register,
    login,
    getUserById,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
};
