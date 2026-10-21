const { asyncHandler } = require("../utils/asyncHandler");
const { User } = require("../models/User");
const { Component } = require("../models/Component");
const { Plan } = require("../models/Plan");
const { Subscription } = require("../models/Subscription");
const { Transaction } = require("../models/Transaction");

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

// @desc    Get all subscriptions for a user (Admin only)
// @route   GET /api/users/:id/subscriptions
// @access  Private/Admin
const getUserSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ userId: req.params.id })
    .populate("planId")
    .populate("transactions")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: subscriptions,
  });
});

// @desc    Manually activate a plan for a user (Admin only)
// @route   POST /api/users/:id/activate-plan
// @access  Private/Admin
const activateUserPlan = asyncHandler(async (req, res) => {
  const {
    planId,
    customDurationDays,
    customComponentLimit,
    transactionId,
    bankName,
    paymentDate,
    amount,
    isPromotion,
  } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const plan = await Plan.findById(planId);
  if (!plan) {
    res.status(404);
    throw new Error("Plan not found");
  }

  let formattedTxId = "";
  if (isPromotion) {
    formattedTxId = `PROMO_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  } else {
    if (!transactionId || !transactionId.trim()) {
      res.status(400);
      throw new Error("Transaction ID is required");
    }
    formattedTxId = transactionId.trim();

    // Check if a transaction with this transaction ID already exists
    const existingTx = await Transaction.findOne({ razorpayPaymentId: formattedTxId });
    if (existingTx) {
      res.status(400);
      throw new Error(`Transaction with ID "${formattedTxId}" already exists. Please use a unique transaction ID.`);
    }
  }

  // Cancel any existing active subscriptions for this user
  await Subscription.updateMany(
    { userId: user._id, status: "active" },
    { $set: { status: "cancelled" } }
  );

  const durationDays = Number(customDurationDays) || plan.durationDays;
  const maxComponents = Number(customComponentLimit) || plan.componentLimit;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  const subscription = await Subscription.create({
    userId: user._id,
    planId: plan._id,
    status: "active",
    startDate,
    endDate,
    maxComponents,
    componentCountUsed: 0,
    transactions: [],
  });

  const parsedAmount = Number(amount);
  const amountInPaise = isPromotion
    ? 0
    : !isNaN(parsedAmount) && parsedAmount > 0
    ? Math.round(parsedAmount * 100)
    : plan.price;

  const txDate = isPromotion
    ? new Date()
    : paymentDate
    ? new Date(paymentDate)
    : new Date();

  const finalPaymentMethod = isPromotion
    ? "Admin Promotion (Complimentary)"
    : bankName && bankName.trim()
    ? `Bank Transfer (${bankName.trim()})`
    : "Manual Offline";

  const finalBankName = isPromotion
    ? "N/A (Promotion)"
    : bankName && bankName.trim()
    ? bankName.trim()
    : null;

  const transaction = await Transaction.create({
    userId: user._id,
    subscriptionId: subscription._id,
    planId: plan._id,
    razorpayPaymentId: formattedTxId,
    razorpayOrderId: isPromotion ? `PROMO_ORD_${Date.now()}` : `MANUAL_ORD_${Date.now()}`,
    amount: amountInPaise,
    currency: "INR",
    status: "captured",
    paymentMethod: finalPaymentMethod,
    bankName: finalBankName,
    paymentDate: txDate,
    metadata: {
      isManual: true,
      isPromotion: Boolean(isPromotion),
      transactionId: formattedTxId,
      bankName: finalBankName || "",
      paymentDate: txDate.toISOString(),
      amountInRupees: isPromotion ? 0 : !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : Math.floor(plan.price / 100),
      activatedByAdminId: req.user?._id || req.user?.userId || null,
    },
  });

  subscription.transactions.push(transaction._id);
  await subscription.save();

  user.activeSubscription = subscription._id;
  user.isProUser = true;
  await user.save();

  const updatedUser = await User.findById(user._id)
    .select("-password")
    .populate({ path: "activeSubscription", populate: { path: "planId" } });

  res.status(200).json({
    success: true,
    message: isPromotion
      ? `Promotional plan "${plan.displayName}" activated successfully for ${user.name}`
      : `Plan "${plan.displayName}" activated successfully for ${user.name}`,
    data: {
      user: {
        id: updatedUser._id.toString(),
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status || "active",
        authProvider: updatedUser.authProvider || (updatedUser.googleId ? "google" : "local"),
        profilePicture: updatedUser.profilePicture || "",
        role: updatedUser.role || "user",
        isProUser: !!updatedUser.isProUser,
        activeSubscription: updatedUser.activeSubscription,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      subscription,
    },
  });
});

// @desc    Manually cancel/deactivate active subscription for a user (Admin only)
// @route   POST /api/users/:id/cancel-subscription
// @access  Private/Admin
const cancelUserSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.activeSubscription) {
    await Subscription.findByIdAndUpdate(user.activeSubscription, {
      status: "cancelled",
    });
  }

  await Subscription.updateMany(
    { userId: user._id, status: "active" },
    { $set: { status: "cancelled" } }
  );

  user.activeSubscription = null;
  user.isProUser = false;
  await user.save();

  const updatedUser = await User.findById(user._id)
    .select("-password")
    .populate({ path: "activeSubscription", populate: { path: "planId" } });

  res.status(200).json({
    success: true,
    message: `Subscription deactivated for ${user.name}`,
    data: {
      user: {
        id: updatedUser._id.toString(),
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status || "active",
        authProvider: updatedUser.authProvider || (updatedUser.googleId ? "google" : "local"),
        profilePicture: updatedUser.profilePicture || "",
        role: updatedUser.role || "user",
        isProUser: !!updatedUser.isProUser,
        activeSubscription: updatedUser.activeSubscription,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    },
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getUserSubscriptions,
  activateUserPlan,
  cancelUserSubscription,
};
