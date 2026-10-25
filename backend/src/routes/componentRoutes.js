const express = require("express");
const {
  listComponents,
  listMyComponents,
  createComponent,
  getComponent,
  getComponentData,
  recordComponentDownload,
  updateComponent,
  deleteComponent,
  listFavoriteComponents,
  listFavoriteComponentIds,
  toggleFavoriteComponent,
  getApprovedTags,
} = require("../controllers/componentController");
const { protect, optionalProtect } = require("../middleware/auth");

const router = express.Router();

router.get("/", optionalProtect, listComponents);
router.get("/admin", protect, require("../controllers/componentController").listComponentsAdmin);
router.get("/my", protect, listMyComponents);
router.get("/favorites/ids", protect, listFavoriteComponentIds);
router.get("/favorites", protect, listFavoriteComponents);
router.get("/top-creators", require("../controllers/componentController").getTopCreators);
router.get("/tags", getApprovedTags);
router.get("/:id", getComponent);
router.get("/:id/data", optionalProtect, getComponentData);
router.post("/", protect, createComponent);
router.post("/:id/download", recordComponentDownload);
router.patch("/:id", protect, updateComponent);
router.patch("/:id/favorite", protect, toggleFavoriteComponent);
router.patch("/:id/status", protect, require("../controllers/componentController").updateComponentStatus);
router.patch("/:id/visibility", protect, require("../controllers/componentController").updateComponentVisibility);
router.delete("/:id", protect, deleteComponent);

module.exports = router;
