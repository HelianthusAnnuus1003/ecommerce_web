const userRouter = require("./user");
const productRouter = require("./product");
const { notFound, errorHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => {
    app.use("/api/user", userRouter);
    app.use("/api/product", productRouter);

    // Khi khong truy cap duoc nhung api nao o tren thi chay vao not found
    app.use(notFound);
    // Hứng tất cả các lỗi phát sinh ra từ các api ở trên
    app.use(errorHandler);
};

module.exports = initRoutes;
