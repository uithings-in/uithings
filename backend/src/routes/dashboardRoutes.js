const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Admin only routes
router.use(protect);
router.use(restrictTo("admin"));

router.get("/stats", getDashboardStats);

module.exports = router;
