const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["component_uploaded", "component_updated", "user_registered", "subscription_created", "system"],
      default: "component_uploaded",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      componentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      componentName: {
        type: String,
        default: "",
      },
      previewImageUrl: {
        type: String,
        default: "",
      },
      status: {
        type: String,
        default: "pending",
      },
      pricingType: {
        type: String,
        default: "Free",
      },
      authorName: {
        type: String,
        default: "",
      },
      authorEmail: {
        type: String,
        default: "",
      },
    },
    read: {
      type: Boolean,
      default: false,
    },
    recipientRole: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
