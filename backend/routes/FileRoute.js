// backend/routes/fileRoutes.js
const express = require("express");
const {
  createFile,
  getDirectoryStructure,
  deleteFile,
  renameFile,
  moveFile,
  getFileParentId,
} = require("../controllers/Filecontroller");
const router = express.Router();

router.get("/", getDirectoryStructure); // Get root files/folders
router.post("/create", createFile); // Create file/folder
router.post("/move", moveFile); // Create file/folder
router.put("/rename/:id", renameFile); // Rename file/folder
router.delete("/delete/:id", deleteFile); //// Delete file/folder
router.get("/:fileId/parent", getFileParentId);

module.exports = router;
