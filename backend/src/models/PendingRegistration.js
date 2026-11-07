const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Number,
      default: () => Date.now(),
    },
    expiresAt: {
      type: Number,
      required: true,
    },
    cooldownUntil: {
      type: Number,
      default: 0,
    },
    expireAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model("PendingRegistration", pendingRegistrationSchema);
