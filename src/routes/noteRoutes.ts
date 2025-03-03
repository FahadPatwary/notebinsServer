import { Router } from "express";
import * as noteController from "../controllers/noteController";

const router = Router();

// Note routes
router.post("/", noteController.createNote);
router.get("/:id", noteController.getNoteById);
router.put("/:id", noteController.updateNote);
router.post("/:id/verify", noteController.verifyNotePassword);

// Saved note routes
router.post("/save", noteController.saveNoteToLibrary);
router.get("/saved", noteController.getSavedNotes);
router.get("/saved/:id", noteController.getSavedNoteById);
router.post("/saved/:id/verify", noteController.verifySavedNotePassword);
router.delete("/saved/:id", noteController.deleteSavedNote);
router.get("/check/:noteId", noteController.checkExistingNote);

export default router;
