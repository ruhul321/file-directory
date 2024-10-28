# Project Setup

To see changes in the application, start both the frontend and backend servers.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (Node Package Manager)

## Environment Variables

Create a `.env` file in the `Frontend` directory with the required variables. For example:

REACT_APP_API_BASE_URL=http://localhost:3000/api

## Starting the Servers

1. Start the Backend Server

# Navigate to the Backend directory:

cd Backend
npm install
npm run dev

2. Start the Frontend Server

# Navigate to the Frontend directory:

cd Frontend
npm install
npm start

# The frontend application should now be running on http://localhost:3001 (or another available port if 3000 is occupied by the backend).
