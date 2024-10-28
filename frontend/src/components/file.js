// src/components/File.js
import React, { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { useDrag } from "react-dnd"; // Import useDrag
import api from "../api/api";

const File = ({ file, onRefresh, onDrop }) => {
  // Add onDrop prop
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  // Drag-and-drop logic
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "file", // Specify the type of item being dragged
    item: { fileId: file._id, parentId: file.parentId }, // The data to be used during the drag operation
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(), // Track if the item is currently being dragged
    }),
  }));

  // Rename file
  const handleRename = async () => {
    if (newName.trim() === "") return;
    try {
      await api.renameFile(file._id, newName);
      setIsRenaming(false);
      onRefresh(); // Fetch updated structure
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  };

  // Delete file
  const handleDelete = async () => {
    try {
      await api.deleteFile(file._id);
      onRefresh(); // Fetch updated structure
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div
      ref={drag} // Set the drag reference
      className="file-item"
      style={{
        display: "flex",
        alignItems: "center",
        opacity: isDragging ? 0.5 : 1, // Make the item semi-transparent when dragging
      }}
    >
      <FaFileAlt />
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
          {file.name}
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
        </>
      )}
    </div>
  );
};

export default File;
