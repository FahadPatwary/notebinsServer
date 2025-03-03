"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCleanupService = void 0;
const logger_1 = require("../config/logger");
const Note_1 = require("../models/Note");
const SavedNote_1 = require("../models/SavedNote");
/**
 * Cleanup service to remove expired notes
 */
const setupCleanupService = () => {
    // Run cleanup every 24 hours
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const cleanupExpiredNotes = async () => {
        try {
            const now = new Date();
            // Delete expired notes
            const notesResult = await Note_1.Note.deleteMany({ expiresAt: { $lt: now } });
            // Delete expired saved notes
            const savedNotesResult = await SavedNote_1.SavedNote.deleteMany({
                expiresAt: { $lt: now },
            });
            logger_1.logger.info(`Cleanup completed: Removed ${notesResult.deletedCount} notes and ${savedNotesResult.deletedCount} saved notes`);
        }
        catch (error) {
            logger_1.logger.error("Error during cleanup:", error);
        }
    };
    // Run cleanup immediately on startup
    cleanupExpiredNotes();
    // Schedule periodic cleanup
    setInterval(cleanupExpiredNotes, CLEANUP_INTERVAL);
    logger_1.logger.info("Cleanup service initialized");
};
exports.setupCleanupService = setupCleanupService;
//# sourceMappingURL=cleanupService.js.map