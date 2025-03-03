# NoteBins Backend Architecture

## Overview

The NoteBins backend is a Node.js application built with Express and TypeScript. It provides a RESTful API for creating, reading, updating, and deleting notes, as well as real-time collaboration features using Socket.io.

## Architecture

### Core Components

1. **Express Server**: Handles HTTP requests and responses
2. **Socket.io Server**: Manages real-time communication
3. **MongoDB Database**: Stores notes and saved notes
4. **Cleanup Service**: Automatically removes expired notes

### Directory Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── index.ts        # Entry point
├── dist/               # Compiled JavaScript
├── logs/               # Application logs
├── .env                # Environment variables
└── package.json        # Dependencies
```

## Data Models

### Note

- `id`: Unique identifier (nanoid)
- `content`: Note content
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `expiresAt`: Expiration timestamp
- `isPasswordProtected`: Whether the note is password protected
- `password`: Hashed password (if protected)
- `isCompressed`: Whether the content is compressed
- `contentLength`: Length of the content

### SavedNote

- `_id`: MongoDB ObjectId
- `title`: Note title
- `content`: Note content
- `noteId`: Reference to the original note
- `url`: URL to access the note
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `expiresAt`: Expiration timestamp
- `contentLength`: Length of the content
- `isCompressed`: Whether the content is compressed
- `isPasswordProtected`: Whether the note is password protected
- `password`: Hashed password (if protected)

## API Endpoints

### Notes

- `POST /api/notes`: Create a new note
- `GET /api/notes/:id`: Get a note by ID
- `PUT /api/notes/:id`: Update a note
- `POST /api/notes/:id/verify`: Verify note password

### Saved Notes

- `POST /api/notes/save`: Save a note to library
- `GET /api/notes/saved`: Get all saved notes
- `GET /api/notes/saved/:id`: Get a saved note by ID
- `POST /api/notes/saved/:id/verify`: Verify saved note password
- `DELETE /api/notes/saved/:id`: Delete a saved note
- `GET /api/notes/check/:noteId`: Check if a note exists in the library

## Socket.io Events

### Client to Server

- `note:join`: Join a note room
- `note:leave`: Leave a note room
- `note:update`: Update a note

### Server to Client

- `note:update`: Receive note updates
- `note:connections`: Receive connection count updates

## Security Features

- Password protection for notes
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for HTTP security headers
- Input validation

## Deployment

The application is designed to be deployed to Azure App Service. The deployment process includes:

1. Building the TypeScript code
2. Setting up environment variables
3. Configuring the web server (web.config)
4. Starting the Node.js application

## Monitoring and Logging

- Winston logger for application logs
- Morgan for HTTP request logging
- Error tracking and handling
