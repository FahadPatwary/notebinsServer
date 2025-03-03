# NoteBins API Documentation

This document describes the API endpoints available in the NoteBins backend.

## Base URL

```
https://your-azure-app-service-name.azurewebsites.net/api
```

## Authentication

Most endpoints do not require authentication. Password-protected notes require the password to be provided in the request body.

## Notes API

### Create a Note

Creates a new note.

- **URL**: `/notes`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "content": "Note content (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "id": "note_id",
    "content": "Note content",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```

### Get a Note

Retrieves a note by ID.

- **URL**: `/notes/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "id": "note_id",
    "content": "Note content",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```

### Update a Note

Updates a note's content.

- **URL**: `/notes/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "content": "Updated note content"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Note updated successfully"
  }
  ```

### Verify Note Password

Verifies the password for a password-protected note.

- **URL**: `/notes/:id/verify`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "password": "note_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "id": "note_id",
    "content": "Note content",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```

## Saved Notes API

### Save Note to Library

Saves a note to the library.

- **URL**: `/notes/save`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "Note title",
    "noteId": "note_id",
    "content": "Note content",
    "password": "optional_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Note saved to library",
    "note": {
      "_id": "saved_note_id",
      "title": "Note title",
      "noteId": "note_id",
      "url": "note_url",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "expiresAt": "2023-01-04T00:00:00.000Z",
      "contentLength": 123,
      "isCompressed": false,
      "isPasswordProtected": false
    }
  }
  ```

### Get All Saved Notes

Retrieves all saved notes.

- **URL**: `/notes/saved`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "count": 1,
    "notes": [
      {
        "_id": "saved_note_id",
        "title": "Note title",
        "noteId": "note_id",
        "url": "note_url",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "expiresAt": "2023-01-04T00:00:00.000Z",
        "contentLength": 123,
        "isCompressed": false,
        "isPasswordProtected": false
      }
    ]
  }
  ```

### Get a Saved Note

Retrieves a saved note by ID.

- **URL**: `/notes/saved/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "note": {
      "_id": "saved_note_id",
      "title": "Note title",
      "content": "Note content",
      "noteId": "note_id",
      "url": "note_url",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "expiresAt": "2023-01-04T00:00:00.000Z",
      "contentLength": 123,
      "isCompressed": false,
      "isPasswordProtected": false
    }
  }
  ```

### Verify Saved Note Password

Verifies the password for a password-protected saved note.

- **URL**: `/notes/saved/:id/verify`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "password": "note_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "note": {
      "_id": "saved_note_id",
      "title": "Note title",
      "content": "Note content",
      "noteId": "note_id",
      "url": "note_url",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "expiresAt": "2023-01-04T00:00:00.000Z",
      "contentLength": 123,
      "isCompressed": false,
      "isPasswordProtected": true
    }
  }
  ```

### Delete a Saved Note

Deletes a saved note.

- **URL**: `/notes/saved/:id`
- **Method**: `DELETE`
- **Request Body** (only required if note is password-protected):
  ```json
  {
    "password": "note_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Note deleted successfully"
  }
  ```

### Check if Note Exists in Library

Checks if a note exists in the library by its original note ID.

- **URL**: `/notes/check/:noteId`
- **Method**: `GET`
- **Response** (if found):
  ```json
  {
    "success": true,
    "note": {
      "_id": "saved_note_id",
      "title": "Note title",
      "noteId": "note_id",
      "url": "note_url",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "expiresAt": "2023-01-04T00:00:00.000Z",
      "contentLength": 123,
      "isCompressed": false,
      "isPasswordProtected": false
    }
  }
  ```
- **Response** (if not found):
  ```json
  {
    "success": false,
    "message": "Note not found in library"
  }
  ```

## Socket.io Events

The NoteBins backend also supports real-time collaboration using Socket.io.

### Client to Server Events

- `note:join`: Join a note room

  ```javascript
  socket.emit("note:join", "note_id");
  ```

- `note:leave`: Leave a note room

  ```javascript
  socket.emit("note:leave", "note_id");
  ```

- `note:update`: Update a note
  ```javascript
  socket.emit("note:update", {
    noteId: "note_id",
    content: "Updated content",
  });
  ```

### Server to Client Events

- `note:update`: Receive note updates

  ```javascript
  socket.on("note:update", (update) => {
    console.log(update.noteId, update.content);
  });
  ```

- `note:connections`: Receive connection count updates
  ```javascript
  socket.on("note:connections", (data) => {
    console.log("Connected users:", data.count);
  });
  ```
