const { asyncHandler } = require("../utils/asyncHandler");
const { ContactMessage } = require("../models/ContactMessage");
const {
  sendNewContactRequestEmail,
  sendContactReplyEmail,
} = require("../utils/mailer");

const SUPPORT_EMAIL = (process.env.CONTACT_TO_EMAIL || "").trim();

function getContactOwnerId(contact) {
  return contact.userId && contact.userId._id
    ? String(contact.userId._id)
    : String(contact.userId);
}

const createContactMessage = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    company = "",
    country,
    subject = "",
    message,
  } = req.body || {};

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
    subject: String(subject || "").trim(),
    message: String(message).trim(),
    status: "submitted",
  });

  try {
    await sendNewContactRequestEmail({
      to: SUPPORT_EMAIL,
      replyTo: contact.email,
      name: contact.name,
      email: contact.email,
      company: contact.company,
      country: contact.country,
      subject: contact.subject,
      message: contact.message,
    });
    contact.mailError = "";
    contact.mailSentAt = new Date();
    await contact.save();
  } catch (error) {
    contact.mailError = String(error?.message || "Mail delivery failed").slice(
      0,
      300,
    );
    await contact.save();
  }

  res.status(201).json({
    success: true,
    data: {
      id: contact._id,
      subject: contact.subject,
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

const replyToContactMessage = asyncHandler(async (req, res) => {
  const { body } = req.body || {};
  const text = String(body || "").trim();

  if (!text) {
    res.status(400);
    throw new Error("Reply cannot be empty.");
  }

  const contact = await ContactMessage.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Request not found.");
  }

  const isAdmin = req.user.role === "admin";
  if (!isAdmin && getContactOwnerId(contact) !== String(req.user.userId)) {
    res.status(403);
    throw new Error("You do not have access to this request.");
  }

  contact.replies = contact.replies || [];
  contact.replies.push({
    author: isAdmin ? "admin" : "user",
    body: text,
    readByUser: !isAdmin,
    readByAdmin: isAdmin,
    createdAt: new Date(),
  });
  contact.status = isAdmin ? "replied" : "submitted";
  await contact.save();

  try {
    if (isAdmin) {
      await sendContactReplyEmail({
        to: contact.email,
        replyTo: SUPPORT_EMAIL || undefined,
        name: contact.name,
        subject: contact.subject,
        body: text,
        fromAdmin: true,
      });
      contact.mailError = "";
      contact.mailSentAt = new Date();
    } else {
      await sendContactReplyEmail({
        to: SUPPORT_EMAIL,
        replyTo: contact.email,
        name: contact.name,
        subject: contact.subject,
        body: text,
        fromAdmin: false,
      });
      contact.mailError = "";
      contact.mailSentAt = new Date();
    }
    await contact.save();
  } catch (error) {
    contact.mailError = String(error?.message || "Mail delivery failed").slice(
      0,
      300,
    );
    await contact.save();
  }

  res.json({
    success: true,
    data: {
      id: contact._id,
      status: contact.status,
      replies: contact.replies,
      updatedAt: contact.updatedAt,
    },
  });
});

const markContactThreadRead = asyncHandler(async (req, res) => {
  const contact = await ContactMessage.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Request not found.");
  }

  const isAdmin = req.user.role === "admin";
  if (!isAdmin && getContactOwnerId(contact) !== String(req.user.userId)) {
    res.status(403);
    throw new Error("You do not have access to this request.");
  }

  contact.replies = contact.replies || [];
  contact.replies.forEach((reply) => {
    if (isAdmin) {
      if (reply.author === "user") reply.readByAdmin = true;
    } else if (reply.author === "admin") {
      reply.readByUser = true;
    }
  });
  contact.markModified("replies");
  await contact.save();

  res.json({
    success: true,
    data: {
      id: contact._id,
      replies: contact.replies,
    },
  });
});

module.exports = {
  createContactMessage,
  listMyContactMessages,
  listContactMessages,
  replyToContactMessage,
  markContactThreadRead,
};
