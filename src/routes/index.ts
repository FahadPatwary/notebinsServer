import { Router } from "express";
import noteRoutes from "./noteRoutes";

const router = Router();

// Use note routes
router.use("/notes", noteRoutes);

export default router;
