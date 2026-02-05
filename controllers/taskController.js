import asyncHandler from "express-async-handler";
import Task from "../models/taskModel.js";
import cache from "../utils/cache.js";
import {clearUserSkillCache} from "../utils/clearUserSkillCache.js";

/* ---------------------------------- */
/* ➕ Add Task */
/* ---------------------------------- */
export const addTask = asyncHandler(async (req, res) => {
  const {title} = req.body;
  const {skillId} = req.params;

  const task = await Task.create({
    user: req.user._id,
    skill: skillId,
    title,
  });

  // ❗ clear skills cache (progress changes)
  clearUserSkillCache(req.user._id);

  // ❗ clear all task cache for this skill
  cache.keys().forEach((key) => {
    if (key.startsWith(`tasks_${req.user._id}_${skillId}`)) {
      cache.del(key);
    }
  });

  res.status(201).json(task);
});

/* ---------------------------------- */
/* 📥 Get Tasks By Skill (CACHED) */
/* ---------------------------------- */
export const getTasksBySkill = asyncHandler(async (req, res) => {
  const {skillId} = req.params;

  const search = req.query.search || "all";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const completed = req.query.completed || "all";

  const cacheKey = `tasks_${req.user._id}_${skillId}_${search}_${completed}_${page}`;

  // 1️⃣ Check cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  const skip = (page - 1) * limit;

  let filter = {
    user: req.user._id,
    skill: skillId,
  };

  if (search !== "all") {
    filter.$text = {$search: search};
  }

  if (completed !== "all") {
    filter.completed = completed === "true";
  }

  const tasks = await Task.find(filter)
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

  const totalTasks = await Task.countDocuments(filter);

  const response = {
    page,
    totalPages: Math.ceil(totalTasks / limit),
    totalTasks,
    tasks,
  };

  // 2️⃣ Save cache
  cache.set(cacheKey, response);

  res.status(200).json(response);
});

/* ---------------------------------- */
/* 🔁 Toggle Task */
/* ---------------------------------- */
export const toggleTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.taskId,
    user: req.user._id,
  });

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  task.completed = !task.completed;
  await task.save();

  // ❗ clear skills cache (progress changes)
  clearUserSkillCache(req.user._id);

  // ❗ clear all task caches for this skill
  cache.keys().forEach((key) => {
    if (key.startsWith(`tasks_${req.user._id}_${task.skill}`)) {
      cache.del(key);
    }
  });

  res.status(200).json(task);
});
