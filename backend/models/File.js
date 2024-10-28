const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["file", "folder"], required: true }, // File or folder
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    default: null,
  }, // Parent folder
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }], // Child files/folders
});

module.exports = mongoose.model("File", fileSchema);
