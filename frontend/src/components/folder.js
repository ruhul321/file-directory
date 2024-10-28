// src/components/Folder.js
import React, { useState } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import File from "./file"; // Ensure this path is correct
import { useDrop } from "react-dnd"; // Import useDrop
import api from "../api/api";

const Folder = ({
  folder,
  onRefresh,
  onCreateItem,
  setShowInput,
  setNewItemName,
  setIsCreatingFolder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const toggleFolder = () => {
    setIsOpen((prev) => !prev);
  };

  const handleRename = async () => {
    if (newName.trim() === "") return;
    try {
      await api.renameFile(folder._id, newName);
      setIsRenaming(false);
      onRefresh(); // Refresh directory structure
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteFile(folder._id);
      onRefresh(); // Refresh directory structure
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleCreateInFolder = () => {
    onCreateItem(folder._id); // Set parent folder ID for creating new items
    setShowInput(true); // Show input field for creating an item
    setNewItemName(""); // Clear input field
    setIsCreatingFolder(true); // Default to creating a folder (can change later)
  };

  // Set up drop target for files
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: ["file", "folder"], // Accept items of type 'file'
      drop: (item) => {
        // Move the file when dropped
        handleDrop(item.fileId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(), // Check if the item is currently being dragged over this folder
        canDrop: monitor.canDrop(), // Check if a file can be dropped here
      }),
    }),
    [folder]
  );

  const handleDrop = async (fileId) => {
    try {
      // Fetch the current parent ID of the file
      const currentParentId = await api.getFileParentId(fileId);

      // Check if the file is being dropped into its current parent folder
      if (currentParentId === folder._id) {
        console.warn("Cannot move file into its own parent folder.");
        return; // Exit if trying to move into its own parent folder
      }

      console.log(
        "Moving file with ID:",
        fileId,
        "to new parent ID:",
        folder._id
      );

      await api.moveFile({ fileId, newParentId: folder._id });

      // Debounce refresh to ensure data update settles
      setTimeout(() => {
        onRefresh(); // Refresh directory structure
      }, 100); // Adjust time as needed
    } catch (error) {
      console.error("Error moving file:", error);
    }
  };

  const uniqueChildren = (children) => {
    const seenIds = new Set();
    return children.filter((child) => {
      if (seenIds.has(child._id)) return false;
      seenIds.add(child._id);
      return true;
    });
  };

  return (
    <div ref={drop} className="folder-item" style={{ position: "relative" }}>
      <div
        onClick={toggleFolder}
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        {isOpen ? <FaFolderOpen /> : <FaFolder />}
        {isRenaming ? (
          <>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              autoFocus
            />
            <button onClick={handleRename}>Save</button>
            <button onClick={() => setIsRenaming(false)}>Cancel</button>
          </>
        ) : (
          <>
            {folder.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
            >
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateInFolder(); // Handle creating inside this folder
              }}
            >
              New Item
            </button>
          </>
        )}
      </div>
      {isOpen &&
        Array.isArray(folder.children) &&
        folder.children.length > 0 && (
          <div className="folder-contents" style={{ paddingLeft: 20 }}>
            {folder.children &&
              uniqueChildren(folder.children).map((item) =>
                item.type === "file" ? (
                  <File key={item._id} file={item} onRefresh={onRefresh} />
                ) : (
                  <Folder
                    key={item._id}
                    folder={item}
                    onRefresh={onRefresh}
                    onCreateItem={onCreateItem}
                    setShowInput={setShowInput}
                    setNewItemName={setNewItemName}
                    setIsCreatingFolder={setIsCreatingFolder}
                  />
                )
              )}
          </div>
        )}
      {canDrop && isOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: "2px dashed green",
            pointerEvents: "none", // Prevent blocking interactions with folder
          }}
        />
      )}
    </div>
  );
};

export default Folder;
