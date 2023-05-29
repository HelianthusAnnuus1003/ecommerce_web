const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
    const newProduct = await Product.create(req.body);
    return res.status(200).json({
        success: newProduct ? true : false,
        createdProduct: newProduct
            ? newProduct
            : "Cannot create a new product :<",
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    const productCurrent = await Product.findById(pid);
    return res.status(200).json({
        success: productCurrent ? true : false,
        response: productCurrent ? productCurrent : "Product not found!",
    });
});

const getAllProducts = asyncHandler(async (req, res) => {
    const productCurrents = await Product.find();
    return res.status(200).json({
        success: productCurrents ? true : false,
        response: productCurrents ? productCurrents : "Product not found!",
    });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    if (!pid) throw new Error("Missing input");

    const response = await Product.findByIdAndDelete(pid);

    return res.status(200).json({
        success: response ? true : false,
        deletedProduct: response
            ? `Product ${response.title} deleted successfully`
            : "Delete product failed!",
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    if (!pid || Object.keys(req.body).length === 0)
        throw new Error("Missing input");
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title);

    const response = await Product.findByIdAndUpdate(pid, req.body, {
        new: true,
    }).select("-role -password -refreshToken");

    return res.status(200).json({
        success: response ? true : false,
        updatedProduct: response ? response : "Update product failed!",
    });
});

// const updateUserByAdmin = asyncHandler(async (req, res) => {
//     const { uid } = req.params;
//     if (Object.keys(req.body).length === 0) throw new Error("Missing input");

//     const response = await User.findByIdAndUpdate(uid, req.body, {
//         new: true,
//     }).select("-role -password -refreshToken");

//     return res.status(200).json({
//         success: response ? true : false,
//         updatedUser: response ? response : "Update user failed!",
//     });
// });

module.exports = {
    createProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
    updateUser,
};
