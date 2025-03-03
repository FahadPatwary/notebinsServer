import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { Note, toSafeNote } from "../models/Note";
import { SavedNote, toSafeSavedNote } from "../models/SavedNote";

// Calculate expiration date
const calculateExpirationDate = () => {
  const days = parseInt(process.env.NOTE_EXPIRATION_DAYS || "3", 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
};

// Create a new note
export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content = "" } = req.body;

    const note = new Note({
      content,
      contentLength: content.length,
      expiresAt: calculateExpirationDate(),
    });

    await note.save();

    logger.info(`Note created with ID: ${note.id}`);

    res.status(201).json({
      success: true,
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// Get a note by ID
export const getNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const note = await Note.findOne({ id });

    if (!note) {
      throw new AppError(`Note with ID ${id} not found`, 404);
    }

    // Check if note is expired
    if (new Date() > note.expiresAt) {
      await Note.deleteOne({ id });
      throw new AppError(`Note with ID ${id} has expired`, 404);
    }

    // If note is password protected, don't return content
    if (note.isPasswordProtected) {
      const safeNote = toSafeNote(note);
      return res.status(200).json({
        success: true,
        ...safeNote,
        content: "", // Don't send content for password-protected notes
        isPasswordProtected: true,
      });
    }

    const safeNote = toSafeNote(note);

    res.status(200).json({
      success: true,
      ...safeNote,
    });
  } catch (error) {
    next(error);
  }
};

// Update a note
export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (content === undefined) {
      throw new AppError("Content is required", 400);
    }

    const note = await Note.findOne({ id });

    if (!note) {
      throw new AppError(`Note with ID ${id} not found`, 404);
    }

    // Check if note is expired
    if (new Date() > note.expiresAt) {
      await Note.deleteOne({ id });
      throw new AppError(`Note with ID ${id} has expired`, 404);
    }

    note.content = content;
    note.contentLength = content.length;
    note.updatedAt = new Date();

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Verify note password
export const verifyNotePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new AppError("Password is required", 400);
    }

    const note = await Note.findOne({ id }).select("+password");

    if (!note) {
      throw new AppError(`Note with ID ${id} not found`, 404);
    }

    // Check if note is expired
    if (new Date() > note.expiresAt) {
      await Note.deleteOne({ id });
      throw new AppError(`Note with ID ${id} has expired`, 404);
    }

    // Check if note is password protected
    if (!note.isPasswordProtected) {
      throw new AppError("Note is not password protected", 400);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, note.password || "");

    if (!isMatch) {
      throw new AppError("Invalid password", 401);
    }

    const safeNote = toSafeNote(note);

    res.status(200).json({
      success: true,
      ...safeNote,
    });
  } catch (error) {
    next(error);
  }
};

// Save note to library
export const saveNoteToLibrary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, noteId, content, password } = req.body;

    if (!title || !noteId || !content) {
      throw new AppError("Title, noteId, and content are required", 400);
    }

    // Check if note exists
    const note = await Note.findOne({ id: noteId });

    if (!note) {
      throw new AppError(`Note with ID ${noteId} not found`, 404);
    }

    // Check if note is expired
    if (new Date() > note.expiresAt) {
      await Note.deleteOne({ id: noteId });
      throw new AppError(`Note with ID ${noteId} has expired`, 404);
    }

    // Check if note already exists in library
    const existingNote = await SavedNote.findOne({ noteId });

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

      const safeNote = toSafeSavedNote(existingNote);

      return res.status(200).json({
        success: true,
        message: "Note updated in library",
        note: safeNote,
      });
    }

    // Create new saved note
    const savedNote = new SavedNote({
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

    const safeNote = toSafeSavedNote(savedNote);

    res.status(201).json({
      success: true,
      message: "Note saved to library",
      note: safeNote,
    });
  } catch (error) {
    next(error);
  }
};

// Get all saved notes
export const getSavedNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notes = await SavedNote.find().sort({ updatedAt: -1 });

    const safeNotes = notes.map((note) => toSafeSavedNote(note));

    res.status(200).json({
      success: true,
      count: safeNotes.length,
      notes: safeNotes,
    });
  } catch (error) {
    next(error);
  }
};

// Get a saved note by ID
export const getSavedNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const note = await SavedNote.findById(id);

    if (!note) {
      throw new AppError(`Saved note with ID ${id} not found`, 404);
    }

    // If note is password protected, don't return content
    if (note.isPasswordProtected) {
      const safeNote = toSafeSavedNote(note);
      return res.status(200).json({
        success: true,
        ...safeNote,
        content: "", // Don't send content for password-protected notes
        isPasswordProtected: true,
      });
    }

    const safeNote = toSafeSavedNote(note);

    res.status(200).json({
      success: true,
      note: safeNote,
    });
  } catch (error) {
    next(error);
  }
};

// Verify saved note password
export const verifySavedNotePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new AppError("Password is required", 400);
    }

    const note = await SavedNote.findById(id).select("+password");

    if (!note) {
      throw new AppError(`Saved note with ID ${id} not found`, 404);
    }

    // Check if note is password protected
    if (!note.isPasswordProtected) {
      throw new AppError("Note is not password protected", 400);
    }

    // Verify password
    const isMatch = await note.comparePassword(password);

    if (!isMatch) {
      throw new AppError("Invalid password", 401);
    }

    const safeNote = toSafeSavedNote(note);

    res.status(200).json({
      success: true,
      note: safeNote,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a saved note
export const deleteSavedNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const note = await SavedNote.findById(id).select("+password");

    if (!note) {
      throw new AppError(`Saved note with ID ${id} not found`, 404);
    }

    // Check if note is password protected
    if (note.isPasswordProtected) {
      if (!password) {
        throw new AppError("Password is required to delete this note", 400);
      }

      // Verify password
      const isMatch = await note.comparePassword(password);

      if (!isMatch) {
        throw new AppError("Invalid password", 401);
      }
    }

    await SavedNote.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Check if a note exists in the library
export const checkExistingNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { noteId } = req.params;

    const note = await SavedNote.findOne({ noteId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found in library",
      });
    }

    const safeNote = toSafeSavedNote(note);

    res.status(200).json({
      success: true,
      note: safeNote,
    });
  } catch (error) {
    next(error);
  }
};
