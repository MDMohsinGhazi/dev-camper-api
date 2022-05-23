const express = require("express");
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require("../controllers/auth");

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(protect, getMe);
router.put("/updatedetails", protect, updateDetails);
router.post("/forgotPassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
router.put("/updatepassword", protect, updatePassword);
module.exports = router;
