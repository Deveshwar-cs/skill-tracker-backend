import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {addSkill, getSkills} from "../controllers/skillController.js";

const router = express.Router();
router.post("/addSkill", protect, addSkill);
router.get("/", protect, getSkills);

export default router;
