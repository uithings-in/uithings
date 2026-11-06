const express = require("express");
const {
  requestRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  me,
  googleAuth,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register/request-otp", requestRegistrationOtp);
router.post("/register/verify-otp", verifyRegistrationOtp);
router.post("/register/resend-otp", resendRegistrationOtp);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", protect, me);

module.exports = router;
