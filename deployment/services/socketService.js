"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const logger_1 = require("../config/logger");
const setupSocketHandlers = (io) => {
    // Track active connections per note
    const noteConnections = {};
    // Middleware for logging connections
    io.use((socket, next) => {
        logger_1.logger.info(`Socket connection attempt: ${socket.id}`);
        next();
    });
    io.on("connection", (socket) => {
        logger_1.logger.info(`Socket connected: ${socket.id}`);
        // Handle joining a note room
        socket.on("note:join", (noteId) => {
            if (!noteId) {
                logger_1.logger.warn(`Invalid note ID provided by socket ${socket.id}`);
                return;
            }
            logger_1.logger.info(`Socket ${socket.id} joining note: ${noteId}`);
            // Join the room for this note
            socket.join(noteId);
            // Track connection
            if (!noteConnections[noteId]) {
                noteConnections[noteId] = new Set();
            }
            noteConnections[noteId].add(socket.id);
            // Emit the current number of connections to this note
            const connectionCount = noteConnections[noteId].size;
            io.to(noteId).emit("note:connections", {
                count: connectionCount,
            });
            logger_1.logger.info(`Socket ${socket.id} joined note ${noteId}. Total connections: ${connectionCount}`);
        });
        // Handle leaving a note room
        socket.on("note:leave", (noteId) => {
            handleLeaveNote(socket, noteId);
        });
        // Handle note updates
        socket.on("note:update", (update) => {
            if (!update || !update.noteId) {
                logger_1.logger.warn(`Invalid update data from socket ${socket.id}`);
                return;
            }
            const { noteId, content } = update;
            // Broadcast the update to all clients in the room except the sender
            socket.to(noteId).emit("note:update", {
                noteId,
                content,
            });
            logger_1.logger.debug(`Socket ${socket.id} sent update for note ${noteId}`);
        });
        // Handle disconnection
        socket.on("disconnect", () => {
            logger_1.logger.info(`Socket disconnected: ${socket.id}`);
            // Remove from all note connections
            for (const noteId in noteConnections) {
                if (noteConnections[noteId].has(socket.id)) {
                    handleLeaveNote(socket, noteId);
                }
            }
        });
        // Handle errors
        socket.on("error", (error) => {
            logger_1.logger.error(`Socket ${socket.id} error: ${error.message}`);
        });
        // Health check ping/pong
        socket.on("ping", () => {
            socket.emit("pong");
        });
    });
    // Helper function to handle a socket leaving a note
    const handleLeaveNote = (socket, noteId) => {
        if (!noteId || !noteConnections[noteId]) {
            return;
        }
        // Leave the room
        socket.leave(noteId);
        // Remove from tracking
        noteConnections[noteId].delete(socket.id);
        // If no more connections, clean up
        if (noteConnections[noteId].size === 0) {
            delete noteConnections[noteId];
            logger_1.logger.info(`No more connections to note ${noteId}, cleaned up`);
        }
        else {
            // Emit updated connection count
            const connectionCount = noteConnections[noteId].size;
            io.to(noteId).emit("note:connections", {
                count: connectionCount,
            });
            logger_1.logger.info(`Socket ${socket.id} left note ${noteId}. Remaining connections: ${connectionCount}`);
        }
    };
    // Periodic cleanup of empty rooms (every 5 minutes)
    setInterval(() => {
        for (const noteId in noteConnections) {
            if (noteConnections[noteId].size === 0) {
                delete noteConnections[noteId];
                logger_1.logger.info(`Cleaned up empty note room: ${noteId}`);
            }
        }
    }, 5 * 60 * 1000);
    return io;
};
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=socketService.js.map