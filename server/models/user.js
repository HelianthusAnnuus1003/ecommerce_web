const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "user",
        },
        cart: {
            type: Array,
            default: [],
        },
        address: [{ type: mongoose.Types.ObjectId, ref: "Address" }],
        wishlist: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
        isBlocked: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        passwordChangedAt: {
            type: String,
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Truoc khi tao va luu schema
userSchema.pre("save", async function (next) {
    // Khi thay doi password thi moi hash password
    if (!this.isModified("password")) {
        next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// methods => Tạo ra các hàm trong schema này để sử dụng
userSchema.methods = {
    isCorrectPassword: async function (password) {
        // So sánh password và kiểm tra coi đúng chưa
        return await bcrypt.compare(password, this.password);
    },
    createChangePasswordToken: function () {
        const refreshToken = crypto.randomBytes(32).toString("hex");
        this.passwordResetToken = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");
        this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
        return refreshToken;
    },
};

//Export the model
module.exports = mongoose.model("User", userSchema);
