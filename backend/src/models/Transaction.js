const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    bankName: {
      type: String,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    signature: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    errorCode: {
      type: String,
      default: null,
    },
    errorDescription: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1 });
transactionSchema.index({ razorpayOrderId: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Transaction };