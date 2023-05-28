const router = require("express").Router();
const ctrls = require("../controllers/user");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/login", ctrls.login);
router.post("/register", ctrls.register);
router.get("/current", verifyAccessToken, ctrls.getUserById);
router.put("/current", verifyAccessToken, ctrls.updateUser);
router.put("/:uid", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getAllUsers);
router.delete("/", [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.post("/refreshtoken", ctrls.refreshAccessToken);
router.get("/forgot-password", ctrls.forgotPassword);
router.put("/reset-password", ctrls.resetPassword);
router.get("/logout", ctrls.logout);

module.exports = router;
