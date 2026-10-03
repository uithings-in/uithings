const express = require("express");
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Admin only routes
router.use(protect);
router.use(restrictTo("admin"));

router.get("/", getNotifications);
router.patch("/mark-all-read", markAllNotificationsRead);
router.delete("/clear-all", clearAllNotifications);
router.patch("/:id/read", markNotificationRead);
router.delete("/:id", deleteNotification);

module.exports = router;
