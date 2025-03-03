import { logger } from "../config/logger";
import { Note } from "../models/Note";
import { SavedNote } from "../models/SavedNote";

/**
 * Cleanup service to remove expired notes
 */
export const setupCleanupService = () => {
  // Run cleanup every 24 hours
  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const cleanupExpiredNotes = async () => {
    try {
      const now = new Date();

      // Delete expired notes
      const notesResult = await Note.deleteMany({ expiresAt: { $lt: now } });

      // Delete expired saved notes
      const savedNotesResult = await SavedNote.deleteMany({
        expiresAt: { $lt: now },
      });

      logger.info(
        `Cleanup completed: Removed ${notesResult.deletedCount} notes and ${savedNotesResult.deletedCount} saved notes`
      );
    } catch (error) {
      logger.error("Error during cleanup:", error);
    }
  };

  // Run cleanup immediately on startup
  cleanupExpiredNotes();

  // Schedule periodic cleanup
  setInterval(cleanupExpiredNotes, CLEANUP_INTERVAL);

  logger.info("Cleanup service initialized");
};
