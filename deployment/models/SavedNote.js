"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSafeSavedNote = exports.SavedNote = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importStar(require("mongoose"));
// Define the SavedNote schema
const savedNoteSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Hash password before saving
savedNoteSchema.pre("save", async function (next) {
    const note = this;
    // Only hash the password if it has been modified (or is new)
    if (!note.isModified("password"))
        return next();
    // Only hash if password exists and note is password protected
    if (note.password && note.isPasswordProtected) {
        try {
            const salt = await bcrypt_1.default.genSalt(10);
            note.password = await bcrypt_1.default.hash(note.password, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    }
    else {
        next();
    }
});
// Method to compare passwords
savedNoteSchema.methods.comparePassword = async function (candidatePassword) {
    const note = this;
    // If note is not password protected or no password is set, return true
    if (!note.isPasswordProtected || !note.password) {
        return true;
    }
    try {
        return await bcrypt_1.default.compare(candidatePassword, note.password);
    }
    catch (error) {
        return false;
    }
};
// Create and export the SavedNote model
exports.SavedNote = mongoose_1.default.model("SavedNote", savedNoteSchema);
// Function to convert a SavedNote to a SafeSavedNote
const toSafeSavedNote = (note) => {
    const noteObj = note.toObject();
    const { password, ...safeNote } = noteObj;
    return safeNote;
};
exports.toSafeSavedNote = toSafeSavedNote;
//# sourceMappingURL=SavedNote.js.map