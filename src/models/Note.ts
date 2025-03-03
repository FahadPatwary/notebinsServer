import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";

// Define the Note document interface
export interface INote extends Document {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isPasswordProtected: boolean;
  password?: string;
  isCompressed: boolean;
  contentLength: number;
}

// Define the Note schema
const noteSchema = new Schema<INote>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10),
      index: true,
    },
    content: {
      type: String,
      default: "",
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      select: false, // Don't include in query results by default
    },
    isCompressed: {
      type: Boolean,
      default: false,
    },
    contentLength: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Note model
export const Note = mongoose.model<INote>("Note", noteSchema);

// Create a type for the Note without sensitive fields
export type SafeNote = Omit<INote, "password"> & { password?: undefined };

// Function to convert a Note to a SafeNote
export const toSafeNote = (note: INote): SafeNote => {
  const { password, ...safeNote } = note.toObject();
  return safeNote;
};
