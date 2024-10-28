import React, { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core"; // Import DndContext
import api from "../api/api";
import Folder from "./folder"; // Ensure this path is correct
import File from "./file"; // Ensure this path is correct

function FileExplorer() {
  const [directory, setDirectory] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(true); // Flag to determine if creating folder or file
  const [parentFolderId, setParentFolderId] = useState(null); // For nested structure
  const [showInput, setShowInput] = useState(false); // Flag to show/hide input field

  const fetchDirectory = async () => {
    try {
      const response = await api.getFiles();
      setDirectory(response.data);
    } catch (error) {
      console.error("Error fetching directory:", error);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const handleCreateItem = async () => {
    if (!newItemName.trim()) return; // Prevent empty names
    try {
      const type = isCreatingFolder ? "folder" : "file";
      await api.createFile({
        name: newItemName,
        type,
        parentId: parentFolderId,
      }); // Pass parentId to create inside a folder
      setNewItemName(""); // Clear the input
      setParentFolderId(null); // Reset parent id
      setShowInput(false); // Hide input field after creation
      fetchDirectory(); // Refresh directory
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  return (
    <DndContext>
      <div>
        {directory ? (
          <div>
            <div>
              <button
                onClick={() => {
                  setIsCreatingFolder(true);
                  setParentFolderId(null);
                  setShowInput(true);
                }}
              >
                New Folder
              </button>
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setParentFolderId(null);
                  setShowInput(true);
                }}
              >
                New File
              </button>
            </div>
            {showInput && (
              <div>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={
                    isCreatingFolder ? "Enter folder name" : "Enter file name"
                  }
                />
                <button onClick={handleCreateItem}>Create</button>
                <button onClick={() => setShowInput(false)}>Cancel</button>
              </div>
            )}

            {directory.map((item) => {
              if (item.type === "folder") {
                return (
                  <Folder
                    key={item._id}
                    folder={item}
                    onRefresh={fetchDirectory}
                    onCreateItem={setParentFolderId} // Pass the create function down
                    setShowInput={setShowInput} // Pass function to control input visibility
                    setNewItemName={setNewItemName} // Pass function to set the name
                    setIsCreatingFolder={setIsCreatingFolder} // Pass function to set type
                  />
                );
              } else if (item.type === "file") {
                return (
                  <File key={item._id} file={item} onRefresh={fetchDirectory} />
                );
              }
              return null;
            })}
          </div>
        ) : (
          <p>Loading directory...</p>
        )}
      </div>
    </DndContext>
  );
}

export default FileExplorer;
