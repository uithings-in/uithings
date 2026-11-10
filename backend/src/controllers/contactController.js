const { asyncHandler } = require("../utils/asyncHandler");
const { ContactMessage } = require("../models/ContactMessage");

const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, company = "", country, message } = req.body || {};

  if (!name || !email || !country || !message) {
    res.status(400);
    throw new Error("Please fill in all required fields.");
  }

  const contact = await ContactMessage.create({
    userId: req.user.userId,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    company: String(company || "").trim(),
    country: String(country).trim(),
    message: String(message).trim(),
    status: "submitted",
  });

  res.status(201).json({
    success: true,
    data: {
      id: contact._id,
      status: contact.status,
      createdAt: contact.createdAt,
    },
  });
});

const listMyContactMessages = asyncHandler(async (req, res) => {
  const items = await ContactMessage.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: {
      items,
    },
  });
});

const listContactMessages = asyncHandler(async (req, res) => {
  const items = await ContactMessage.find({})
    .sort({ createdAt: -1 })
    .populate("userId", "name email profilePicture")
    .lean();

  res.json({
    success: true,
    data: {
      items,
    },
  });
});

module.exports = {
  createContactMessage,
  listMyContactMessages,
  listContactMessages,
};
