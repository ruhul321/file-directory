// src/App.js
import React from "react";
import FileExplorer from "./components/filedirectory";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <h1>File Directory</h1>
        <FileExplorer />
      </DndProvider>
    </div>
  );
}

export default App;
