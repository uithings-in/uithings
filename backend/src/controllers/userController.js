const { asyncHandler } = require("../utils/asyncHandler");
const { User } = require("../models/User");
const { Component } = require("../models/Component");

// @desc    Get all registered users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .sort({ createdAt: -1 })
    .select("-password")
    .populate({ path: "activeSubscription", populate: { path: "planId" } });

  res.json({
    success: true,
    count: users.length,
    data: users.map((user) => ({
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      status: user.status || "active",
      authProvider: user.authProvider || (user.googleId ? "google" : "local"),
      profilePicture: user.profilePicture || "",
      role: user.role || "user",
      isProUser: !!user.isProUser,
      activeSubscription: user.activeSubscription,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate({ path: "activeSubscription", populate: { path: "planId" } });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const uploadedComponentsCount = await Component.countDocuments({
    createdBy: user._id,
  });

  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      status: user.status || "active",
      authProvider: user.authProvider || (user.googleId ? "google" : "local"),
      profilePicture: user.profilePicture || "",
      role: user.role || "user",
      isProUser: !!user.isProUser,
      activeSubscription: user.activeSubscription,
      uploadedComponentsCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, role, status, isProUser } = req.body;

  if (name !== undefined) user.name = name.trim();
  if (role !== undefined) user.role = role;
  if (status !== undefined) user.status = status;
  if (isProUser !== undefined) user.isProUser = Boolean(isProUser);

  await user.save();

  res.json({
    success: true,
    message: "User updated successfully",
    data: {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      status: user.status || "active",
      authProvider: user.authProvider || (user.googleId ? "google" : "local"),
      profilePicture: user.profilePicture || "",
      role: user.role,
      isProUser: !!user.isProUser,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc    Bulk delete users
// @route   POST /api/users/bulk-delete
// @access  Private/Admin
const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error("Please provide an array of user IDs to delete");
  }

  const result = await User.deleteMany({ _id: { $in: ids } });

  res.json({
    success: true,
    message: `Successfully deleted ${result.deletedCount} user(s)`,
    deletedCount: result.deletedCount,
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
};
