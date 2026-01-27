import express from "express";
import {
  addNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

import {protect} from "../middleware/authMiddleware.js";
import {body} from "express-validator";
import {validate} from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/add",
  protect,
  [
    body("title").notEmpty().withMessage("Title is required!!"),
    body("content").notEmpty().withMessage("Content is required!!"),
  ],
  validate,
  addNote,
);
router.get("/allnotes", protect, getNotes);
router.get("/note/:id", protect, getNoteById);
router.put("/update/:id", protect, updateNote);
router.delete("/delete/:id", protect, deleteNote);

export default router;
