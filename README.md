# NoteBins Backend

This is the backend server for the NoteBins application, a real-time collaborative note-sharing platform.

## Features

- Create, read, update notes
- Real-time collaboration using Socket.io
- Password protection for notes
- Note expiration (automatic cleanup)
- Save notes to library
- MongoDB database for persistence

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB (with Mongoose)
- Socket.io for real-time communication
- Winston for logging
- Zod for validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies

```bash
cd backend
npm install
```

4. Create a `.env` file based on `.env.example`
5. Build the TypeScript code

```bash
npm run build
```

6. Start the server

```bash
npm start
```

For development with hot-reloading:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root of the backend directory with the following variables:

```
# Server Configuration
PORT=10000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/notebins

# Security
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173

# Note Settings
NOTE_EXPIRATION_DAYS=3

# Azure App Service Settings
WEBSITE_NODE_DEFAULT_VERSION=18.x
```

## API Endpoints

### Notes

- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a note by ID
- `PUT /api/notes/:id` - Update a note
- `POST /api/notes/:id/verify` - Verify note password

### Saved Notes

- `POST /api/notes/save` - Save a note to library
- `GET /api/notes/saved` - Get all saved notes
- `GET /api/notes/saved/:id` - Get a saved note by ID
- `POST /api/notes/saved/:id/verify` - Verify saved note password
- `DELETE /api/notes/saved/:id` - Delete a saved note
- `GET /api/notes/check/:noteId` - Check if a note exists in the library

## Socket.io Events

### Client to Server

- `note:join` - Join a note room
- `note:leave` - Leave a note room
- `note:update` - Update a note

### Server to Client

- `note:update` - Receive note updates
- `note:connections` - Receive connection count updates

## Deployment to Azure

This backend is designed to be deployed to Azure App Service. Follow these steps:

1. Create an Azure App Service
2. Set up environment variables in the Azure Portal
3. Deploy the code using Azure CLI, GitHub Actions, or Azure DevOps

## License

ISC
