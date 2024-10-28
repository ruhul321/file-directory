// src/api/api.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log(API_BASE_URL);

const api = {
  getFiles: () => axios.get(`${API_BASE_URL}/files`),
  createFile: (data) => axios.post(`${API_BASE_URL}/files/create`, data),
  moveFile: (data) => axios.post(`${API_BASE_URL}/files/move`, data),
  renameFile: (id, newName) =>
    axios.put(`${API_BASE_URL}/files/rename/${id}`, { newName }),
  deleteFile: (id) => axios.delete(`${API_BASE_URL}/files/delete/${id}`),
  getFileParentId: async (fileId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/files/${fileId}/parent`
      );
      return response.data.parentId; // Adjust this based on your API response structure
    } catch (error) {
      console.error("Error fetching file parent ID:", error);
      throw error; // Re-throw error to handle it where the function is called
    }
  },
};

export default api;
