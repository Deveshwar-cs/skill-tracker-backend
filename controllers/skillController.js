import asyncHandler from "express-async-handler";
import Skill from "../models/skillModel.js";
import Task from "../models/taskModel.js";
import cache from "../utils/cache.js";

/* ---------------------------------- */
/* 🧹 Helper: Clear all user skill cache */
/* ---------------------------------- */
const clearUserSkillCache = (userId) => {
  const keys = cache.keys();

  keys.forEach((key) => {
    if (key.startsWith(`skills_${userId}`)) {
      cache.del(key);
    }
  });
};

/* ---------------------------------- */
/* ➕ Add Skill */
/* ---------------------------------- */
export const addSkill = asyncHandler(async (req, res) => {
  const {name, description} = req.body;

  const skill = await Skill.create({
    user: req.user._id,
    name,
    description,
  });

  // ❗ Clear all caches of this user
  clearUserSkillCache(req.user._id);

  res.status(201).json(skill);
});

/* ---------------------------------- */
/* 📥 Get Skills with Search + Progress + Cache */
/* ---------------------------------- */
export const getSkills = asyncHandler(async (req, res) => {
  const {search} = req.query;

  const cacheKey = `skills_${req.user._id}_${search || "all"}`;

  // 1️⃣ Check cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  // 2️⃣ Build query
  let query = {user: req.user._id};

  if (search) {
    query.$text = {$search: search};
  }

  // 3️⃣ Fetch skills
  const skills = await Skill.find(query);

  // 4️⃣ Add progress data
  const skillWithProgress = await Promise.all(
    skills.map(async (skill) => {
      const totalTasks = await Task.countDocuments({skill: skill._id});
      const completedTasks = await Task.countDocuments({
        skill: skill._id,
        completed: true,
      });

      return {
        ...skill._doc,
        totalTasks,
        completedTasks,
      };
    }),
  );

  // 5️⃣ Save in cache
  cache.set(cacheKey, skillWithProgress);

  res.status(200).json(skillWithProgress);
});

/* ---------------------------------- */
/* ✏️ Update Skill */
/* ---------------------------------- */
export const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  if (skill.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  skill.name = req.body.name || skill.name;
  skill.description = req.body.description || skill.description;

  const updatedSkill = await skill.save();

  clearUserSkillCache(req.user._id);

  res.status(200).json(updatedSkill);
});

/* ---------------------------------- */
/* ❌ Delete Skill */
/* ---------------------------------- */
export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  if (skill.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  await Task.deleteMany({skill: skill._id});
  await skill.deleteOne();

  clearUserSkillCache(req.user._id);

  res.status(200).json({message: "Skill deleted"});
});
