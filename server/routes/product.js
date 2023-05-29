const router = require("express").Router();
const ctrls = require("../controllers/product");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrls.createProduct);
router.get("/", ctrls.getAllProducts);

router.get("/:pid", ctrls.getProductById);
router.put("/:pid", [verifyAccessToken, isAdmin], ctrls.updateUser);
router.delete("/:pid", [verifyAccessToken, isAdmin], ctrls.deleteProduct);
module.exports = router;
