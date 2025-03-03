"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExistingNote = exports.deleteSavedNote = exports.verifySavedNotePassword = exports.getSavedNoteById = exports.getSavedNotes = exports.saveNoteToLibrary = exports.verifyNotePassword = exports.updateNote = exports.getNoteById = exports.createNote = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const Note_1 = require("../models/Note");
const SavedNote_1 = require("../models/SavedNote");
// Calculate expiration date
const calculateExpirationDate = () => {
    const days = parseInt(process.env.NOTE_EXPIRATION_DAYS || "3", 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
};
// Create a new note
const createNote = async (req, res, next) => {
    try {
        const { content = "" } = req.body;
        const note = new Note_1.Note({
            content,
            contentLength: content.length,
            expiresAt: calculateExpirationDate(),
        });
        await note.save();
        logger_1.logger.info(`Note created with ID: ${note.id}`);
        res.status(201).json({
            success: true,
            id: note.id,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createNote = createNote;
// Get a note by ID
const getNoteById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await Note_1.Note.findOne({ id });
        if (!note) {
            throw new errorHandler_1.AppError(`Note with ID ${id} not found`, 404);
        }
        // Check if note is expired
        if (new Date() > note.expiresAt) {
            await Note_1.Note.deleteOne({ id });
            throw new errorHandler_1.AppError(`Note with ID ${id} has expired`, 404);
        }
        // If note is password protected, don't return content
        if (note.isPasswordProtected) {
            const safeNote = (0, Note_1.toSafeNote)(note);
            return res.status(200).json({
                success: true,
                ...safeNote,
                content: "", // Don't send content for password-protected notes
                isPasswordProtected: true,
            });
        }
        const safeNote = (0, Note_1.toSafeNote)(note);
        res.status(200).json({
            success: true,
            ...safeNote,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNoteById = getNoteById;
// Update a note
const updateNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (content === undefined) {
            throw new errorHandler_1.AppError("Content is required", 400);
        }
        const note = await Note_1.Note.findOne({ id });
        if (!note) {
            throw new errorHandler_1.AppError(`Note with ID ${id} not found`, 404);
        }
        // Check if note is expired
        if (new Date() > note.expiresAt) {
            await Note_1.Note.deleteOne({ id });
            throw new errorHandler_1.AppError(`Note with ID ${id} has expired`, 404);
        }
        note.content = content;
        note.contentLength = content.length;
        note.updatedAt = new Date();
        await note.save();
        res.status(200).json({
            success: true,
            message: "Note updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateNote = updateNote;
// Verify note password
const verifyNotePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!password) {
            throw new errorHandler_1.AppError("Password is required", 400);
        }
        const note = await Note_1.Note.findOne({ id }).select("+password");
        if (!note) {
            throw new errorHandler_1.AppError(`Note with ID ${id} not found`, 404);
        }
        // Check if note is expired
        if (new Date() > note.expiresAt) {
            await Note_1.Note.deleteOne({ id });
            throw new errorHandler_1.AppError(`Note with ID ${id} has expired`, 404);
        }
        // Check if note is password protected
        if (!note.isPasswordProtected) {
            throw new errorHandler_1.AppError("Note is not password protected", 400);
        }
        // Verify password
        const isMatch = await bcrypt_1.default.compare(password, note.password || "");
        if (!isMatch) {
            throw new errorHandler_1.AppError("Invalid password", 401);
        }
        const safeNote = (0, Note_1.toSafeNote)(note);
        res.status(200).json({
            success: true,
            ...safeNote,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyNotePassword = verifyNotePassword;
// Save note to library
const saveNoteToLibrary = async (req, res, next) => {
    try {
        const { title, noteId, content, password } = req.body;
        if (!title || !noteId || !content) {
            throw new errorHandler_1.AppError("Title, noteId, and content are required", 400);
        }
        // Check if note exists
        const note = await Note_1.Note.findOne({ id: noteId });
        if (!note) {
            throw new errorHandler_1.AppError(`Note with ID ${noteId} not found`, 404);
        }
        // Check if note is expired
        if (new Date() > note.expiresAt) {
            await Note_1.Note.deleteOne({ id: noteId });
            throw new errorHandler_1.AppError(`Note with ID ${noteId} has expired`, 404);
        }
        // Check if note already exists in library
        const existingNote = await SavedNote_1.SavedNote.findOne({ noteId });
        if (existingNote) {
            // Update existing note
            existingNote.title = title;
            existingNote.content = content;
            existingNote.contentLength = content.length;
            existingNote.updatedAt = new Date();
            // Update password if provided
            if (password) {
                existingNote.isPasswordProtected = true;
                existingNote.password = password;
            }
            await existingNote.save();
            const safeNote = (0, SavedNote_1.toSafeSavedNote)(existingNote);
            return res.status(200).json({
                success: true,
                message: "Note updated in library",
                note: safeNote,
            });
        }
        // Create new saved note
        const savedNote = new SavedNote_1.SavedNote({
            title,
            content,
            noteId,
            url: `${req.protocol}://${req.get("host")}/${noteId}`,
            contentLength: content.length,
            expiresAt: calculateExpirationDate(),
            isPasswordProtected: !!password,
            password: password || undefined,
        });
        await savedNote.save();
        const safeNote = (0, SavedNote_1.toSafeSavedNote)(savedNote);
        res.status(201).json({
            success: true,
            message: "Note saved to library",
            note: safeNote,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.saveNoteToLibrary = saveNoteToLibrary;
// Get all saved notes
const getSavedNotes = async (req, res, next) => {
    try {
        const notes = await SavedNote_1.SavedNote.find().sort({ updatedAt: -1 });
        const safeNotes = notes.map((note) => (0, SavedNote_1.toSafeSavedNote)(note));
        res.status(200).json({
            success: true,
            count: safeNotes.length,
            notes: safeNotes,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSavedNotes = getSavedNotes;
// Get a saved note by ID
const getSavedNoteById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await SavedNote_1.SavedNote.findById(id);
        if (!note) {
            throw new errorHandler_1.AppError(`Saved note with ID ${id} not found`, 404);
        }
        // If note is password protected, don't return content
        if (note.isPasswordProtected) {
            const safeNote = (0, SavedNote_1.toSafeSavedNote)(note);
            return res.status(200).json({
                success: true,
                ...safeNote,
                content: "", // Don't send content for password-protected notes
                isPasswordProtected: true,
            });
        }
        const safeNote = (0, SavedNote_1.toSafeSavedNote)(note);
        res.status(200).json({
            success: true,
            note: safeNote,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSavedNoteById = getSavedNoteById;
// Verify saved note password
const verifySavedNotePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!password) {
            throw new errorHandler_1.AppError("Password is required", 400);
        }
        const note = await SavedNote_1.SavedNote.findById(id).select("+password");
        if (!note) {
            throw new errorHandler_1.AppError(`Saved note with ID ${id} not found`, 404);
        }
        // Check if note is password protected
        if (!note.isPasswordProtected) {
            throw new errorHandler_1.AppError("Note is not password protected", 400);
        }
        // Verify password
        const isMatch = await note.comparePassword(password);
        if (!isMatch) {
            throw new errorHandler_1.AppError("Invalid password", 401);
        }
        const safeNote = (0, SavedNote_1.toSafeSavedNote)(note);
        res.status(200).json({
            success: true,
            note: safeNote,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifySavedNotePassword = verifySavedNotePassword;
// Delete a saved note
const deleteSavedNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const note = await SavedNote_1.SavedNote.findById(id).select("+password");
        if (!note) {
            throw new errorHandler_1.AppError(`Saved note with ID ${id} not found`, 404);
        }
        // Check if note is password protected
        if (note.isPasswordProtected) {
            if (!password) {
                throw new errorHandler_1.AppError("Password is required to delete this note", 400);
            }
            // Verify password
            const isMatch = await note.comparePassword(password);
            if (!isMatch) {
                throw new errorHandler_1.AppError("Invalid password", 401);
            }
        }
        await SavedNote_1.SavedNote.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Note deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSavedNote = deleteSavedNote;
// Check if a note exists in the library
const checkExistingNote = async (req, res, next) => {
    try {
        const { noteId } = req.params;
        const note = await SavedNote_1.SavedNote.findOne({ noteId });
        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found in library",
            });
        }
        const safeNote = (0, SavedNote_1.toSafeSavedNote)(note);
        res.status(200).json({
            success: true,
            note: safeNote,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkExistingNote = checkExistingNote;
//# sourceMappingURL=noteController.js.map