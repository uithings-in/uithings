const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Admin only routes
router.use(protect);
router.use(restrictTo("admin"));

router.route("/").get(getUsers);
router.post("/bulk-delete", bulkDeleteUsers);
router.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;
