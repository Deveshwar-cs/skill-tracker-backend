import asyncHandler from "express-async-handler";
import Task from "../models/taskModel.js";

export const addTask = asyncHandler(async (req, res) => {
  const {title} = req.body;
  const {skillId} = req.params;

  const task = await Task.create({
    user: req.user._id,
    skill: skillId,
    title,
  });

  res.status(201).json(task);
});

export const getTasksBySkill = asyncHandler(async (req, res) => {
  const {skillId} = req.params;

  // Query params
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const completed = req.query.completed;

  const skip = (page - 1) * limit;

  // Build filter object
  let filter = {
    user: req.user._id,
    skill: skillId,
  };

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

  res.status(200).json(task);
});
