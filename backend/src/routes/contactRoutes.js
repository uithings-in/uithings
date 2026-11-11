const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const {
  createContactMessage,
  listMyContactMessages,
  listContactMessages,
  replyToContactMessage,
  markContactThreadRead,
} = require("../controllers/contactController");

const router = express.Router();

router.get("/mine", protect, listMyContactMessages);
router.get("/", protect, restrictTo("admin"), listContactMessages);
router.post("/", protect, createContactMessage);
router.post("/:id/replies", protect, replyToContactMessage);
router.patch("/:id/read", protect, markContactThreadRead);

module.exports = router;
