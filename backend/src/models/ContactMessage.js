const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    company: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    replies: [
      {
        author: {
          type: String,
          enum: ["user", "admin"],
          required: true,
        },
        body: {
          type: String,
          required: true,
          trim: true,
          maxlength: 4000,
        },
        readByUser: {
          type: Boolean,
          default: false,
        },
        readByAdmin: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["submitted", "emailed", "failed", "replied"],
      default: "submitted",
    },
    mailError: {
      type: String,
      default: "",
    },
    mailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ userId: 1, createdAt: -1 });

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

module.exports = { ContactMessage };
