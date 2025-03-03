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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSafeNote = exports.Note = void 0;
const mongoose_1 = __importStar(require("mongoose"));

// Use a custom nanoid implementation instead of the ESM module
// This avoids the ESM import issue
const customNanoid = (size = 10) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < size; i++) {
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id;
};

// Define the Note schema
const noteSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => customNanoid(10),
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
}, {
    timestamps: true,
});

// Create and export the Note model
exports.Note = mongoose_1.default.model("Note", noteSchema);

// Function to convert a Note to a SafeNote
const toSafeNote = (note) => {
    const { password, ...safeNote } = note.toObject();
    return safeNote;
};
exports.toSafeNote = toSafeNote;
//# sourceMappingURL=Note.js.map