import asyncHandler from "express-async-handler";
import Skill from "../models/skillModel.js";
import Task from "../models/taskModel.js";
import cache from "../utils/cache.js";

export const addSkill = asyncHandler(async (req, res) => {
  const {name, description} = req.body;
  const skill = await Skill.create({
    user: req.user._id,
    name,
    description,
  });
  cache.del(`skills_${req.user._id}`);
  res.status(201).json(skill);
});

export const getSkills = asyncHandler(async (req, res) => {
  const {search} = req.query; // ✅ take search from query
  const cacheKey = `skills_${req.user._id}_${search || "all"}`;

  // 1️⃣ Check cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  // 2️⃣ Build query dynamically
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

  // 5️⃣ Cache result
  cache.set(cacheKey, skillWithProgress);

  res.status(200).json(skillWithProgress);
});
