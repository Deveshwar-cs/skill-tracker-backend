import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {
  addTask,
  getTasksBySkill,
  toggleTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/addTask/:skillId", protect, addTask);
router.get("/getTask/:skillId", protect, getTasksBySkill);
router.put("/toggle/:taskId", protect, toggleTask);

export default router;
