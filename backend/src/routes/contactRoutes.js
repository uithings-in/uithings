const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const {
  createContactMessage,
  listMyContactMessages,
  listContactMessages,
} = require("../controllers/contactController");

const router = express.Router();

router.get("/mine", protect, listMyContactMessages);
router.get("/", protect, restrictTo("admin"), listContactMessages);
router.post("/", protect, createContactMessage);

module.exports = router;
