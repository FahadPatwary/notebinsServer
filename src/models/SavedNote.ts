import bcrypt from "bcrypt";
import mongoose, { Document, Schema } from "mongoose";

// Define the SavedNote document interface
export interface ISavedNote extends Document {
  title: string;
  content: string;
  noteId: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  contentLength: number;
  isCompressed: boolean;
  isPasswordProtected: boolean;
  password?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the SavedNote schema
const savedNoteSchema = new Schema<ISavedNote>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    noteId: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    contentLength: {
      type: Number,
      default: 0,
    },
    isCompressed: {
      type: Boolean,
      default: false,
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      select: false, // Don't include in query results by default
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
savedNoteSchema.pre("save", async function (next) {
  const note = this;

  // Only hash the password if it has been modified (or is new)
  if (!note.isModified("password")) return next();

  // Only hash if password exists and note is password protected
  if (note.password && note.isPasswordProtected) {
    try {
      const salt = await bcrypt.genSalt(10);
      note.password = await bcrypt.hash(note.password, salt);
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare passwords
savedNoteSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const note = this as ISavedNote;

  // If note is not password protected or no password is set, return true
  if (!note.isPasswordProtected || !note.password) {
    return true;
  }

  try {
    return await bcrypt.compare(candidatePassword, note.password);
  } catch (error) {
    return false;
  }
};

// Create and export the SavedNote model
export const SavedNote = mongoose.model<ISavedNote>(
  "SavedNote",
  savedNoteSchema
);

// Create a type for the SavedNote without sensitive fields
export type SafeSavedNote = Omit<ISavedNote, "password" | "comparePassword"> & {
  password?: undefined;
};

// Function to convert a SavedNote to a SafeSavedNote
export const toSafeSavedNote = (note: ISavedNote): SafeSavedNote => {
  const noteObj = note.toObject();
  const { password, ...safeNote } = noteObj;
  return safeNote;
};
