// backend/controllers/fileController.js
const File = require("../models/File");

// Create a new file or folder
exports.createFile = async (req, res) => {
  try {
    const { name, type, parentId } = req.body;

    // Create the new file or folder
    const newFile = new File({
      name,
      type,
      parentId: parentId || null,
      children: [],
    });

    const savedFile = await newFile.save();

    // If a parentId is provided, update the parent folder's children array
    if (parentId) {
      const parentFolder = await File.findById(parentId);
      if (parentFolder) {
        parentFolder.children.push(savedFile._id);
        await parentFolder.save(); // Update the parent folder
      }
    }

    res.status(201).json(savedFile);
  } catch (error) {
    res.status(500).json({ message: "Error creating file or folder", error });
  }
};
const fetchDirectoryWithChildren = async (id) => {
  const folder = await File.findById(id).lean();
  if (!folder) return;

  if (folder.type === "folder" && folder.children.length > 0) {
    folder.children = await Promise.all(
      folder.children.map(async (childId) => {
        return await fetchDirectoryWithChildren(childId);
      })
    );
  }
  return folder;
};
// Fetch all files/folders (root level)
exports.getDirectoryStructure = async (req, res) => {
  try {
    const rootFolders = await File.find({ parentId: null }).lean();
    const populatedStructure = await Promise.all(
      rootFolders.map((folder) => fetchDirectoryWithChildren(folder))
    );
    res.json(populatedStructure);
  } catch (error) {
    console.error("Error fetching directory structure:", error);
    res.status(500).json({ error: "Failed to fetch directory structure" });
  }
};

// Rename a file or folder
exports.renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const updatedFileOrFolder = await File.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    );
    if (!updatedFileOrFolder) {
      return res.status(404).json({ message: "File or folder not found" });
    }
    res.status(200).json(updatedFileOrFolder);
  } catch (error) {
    res.status(500).json({ error: "Error renaming file/folder" });
  }
};
// Delete a file or folder
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    // Recursive function to delete a folder and its children
    const deleteFolderRecursively = async (folderId) => {
      const folder = await File.findById(folderId);
      if (!folder) return;

      // Loop through all children and delete each recursively
      for (const child of folder.children) {
        // Check if `child` is an object (nested structure) or just an ID
        const childId =
          typeof child === "object" && child._id ? child._id : child;
        const childDoc = await File.findById(childId);

        if (childDoc && childDoc.type === "folder") {
          await deleteFolderRecursively(childId);
        } else {
          await File.findByIdAndDelete(childId);
        }
      }

      // Finally, delete the folder itself
      await File.findByIdAndDelete(folderId);
    };

    const fileorFolder = await File.findById(id);
    if (!fileorFolder) {
      return res.status(404).json({ message: "File or folder not found" });
    }
    if (fileorFolder.type === "folder") {
      await deleteFolderRecursively(id);
    } else {
      await File.findByIdAndDelete(id);
    }
    // Update parent folder after deletion
    if (fileorFolder.parentId) {
      await File.findByIdAndUpdate(fileorFolder.parentId, {
        $pull: { children: id },
      });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting file/folder" });
  }
};

exports.moveFile = async (req, res) => {
  const { fileId, newParentId } = req.body;

  // Check if both fileId and newParentId are provided
  if (!fileId || !newParentId) {
    return res
      .status(400)
      .send({ message: "fileId and newParentId are required." });
  }

  try {
    // Find the file or folder by ID
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send({ message: "File not found." });
    }
    const newParentFolder = await File.findById(newParentId);
    if (!newParentFolder || newParentFolder.type !== "folder") {
      return res.status(404).send({ message: "New parent folder not found." });
    }

    // Update the parentId to the new parent ID
    const oldParentId = file.parentId;
    file.parentId = newParentId;
    await file.save();

    newParentFolder.children.push(fileId);
    await newParentFolder.save(); // Save the updated parent folder

    // If the file was in a different parent, remove it from the old parent's children
    if (oldParentId) {
      const oldParentFolder = await File.findById(oldParentId);
      if (oldParentFolder) {
        oldParentFolder.children = oldParentFolder.children.filter(
          (childId) => !childId.equals(fileId)
        );
        await oldParentFolder.save(); // Save the updated old parent folder
      }
    }

    return res.status(200).send({ message: "File moved successfully." });
  } catch (error) {
    console.error("Error moving file:", error);
    return res.status(500).send({ message: "Error moving file." });
  }
};
exports.getFileParentId = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId); // Fetch the file by its ID
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json({ parentId: file.parentId }); // Return the parent ID in the response
  } catch (error) {
    console.error("Error fetching file parent ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};
