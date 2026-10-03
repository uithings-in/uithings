const { asyncHandler } = require("../utils/asyncHandler");
const { Notification } = require("../models/Notification");
const { Component } = require("../models/Component");
const { User } = require("../models/User");

// @desc    Get all notifications (with auto-sync from component uploads)
// @route   GET /api/notifications
// @access  Private/Admin
const getNotifications = asyncHandler(async (req, res) => {
  // Check if we need to sync initial notifications for existing uploaded components
  const notifCount = await Notification.countDocuments({ type: "component_uploaded" });
  
  if (notifCount === 0) {
    // Populate notifications from recent components
    const recentComponents = await Component.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("createdBy", "name email");

    const initialNotifications = recentComponents.map((comp) => ({
      type: "component_uploaded",
      title: "New Component Uploaded",
      message: `${comp.createdBy?.name || "A user"} uploaded "${comp.name}" (${comp.status || "pending"})`,
      data: {
        componentId: comp._id,
        userId: comp.createdBy?._id,
        componentName: comp.name,
        previewImageUrl: comp.previewImageUrl,
        status: comp.status || "pending",
        pricingType: comp.pricingType || "Free",
        authorName: comp.createdBy?.name || "Author",
        authorEmail: comp.createdBy?.email || "",
      },
      read: false,
      recipientRole: "admin",
      createdAt: comp.createdAt,
      updatedAt: comp.updatedAt,
    }));

    if (initialNotifications.length > 0) {
      await Notification.insertMany(initialNotifications);
    }
  }

  const notifications = await Notification.find({ recipientRole: "admin" })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipientRole: "admin",
    read: false,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  });
});

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private/Admin
const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private/Admin
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipientRole: "admin", read: false }, { read: true });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByIdAndDelete(id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted",
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private/Admin
const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipientRole: "admin" });

  res.status(200).json({
    success: true,
    message: "All notifications cleared",
  });
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
};
