import asyncHandler from "express-async-handler";
import Task from "../models/taskModel.js";
import cache from "../utils/cache.js";

export const addTask = asyncHandler(async (req, res) => {
  const {title} = req.body;
  const {skillId} = req.params;

  const task = await Task.create({
    user: req.user._id,
    skill: skillId,
    title,
  });

  cache.del(`skills_${req.user._id}`);
  res.status(201).json(task);
});

export const getTasksBySkill = asyncHandler(async (req, res) => {
  const {skillId} = req.params;

  const search = req.query.search; // ✅ correct variable
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const completed = req.query.completed;

  const skip = (page - 1) * limit;

  // ✅ base filter
  let filter = {
    user: req.user._id,
    skill: skillId,
  };

  // ✅ apply text search only if provided
  if (search) {
    filter.$text = {$search: search};
  }

  // ✅ completed filter
  if (completed !== undefined) {
    filter.completed = completed === "true";
  }

  const tasks = await Task.find(filter)
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

  const totalTasks = await Task.countDocuments(filter);

  res.status(200).json({
    page,
    totalPages: Math.ceil(totalTasks / limit),
    totalTasks,
    tasks,
  });
});

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

  cache.del(`skills_${req.user._id}`);
  res.status(200).json(task);
});
