import asyncHandler from "express-async-handler";
import Skill from "../models/skillModel.js";
import Task from "../models/taskModel.js";

export const addSkill = asyncHandler(async (req, res) => {
  const {name, description} = req.body;
  const skill = await Skill.create({
    user: req.user._id,
    name,
    description,
  });
  res.status(201).json(skill);
});

export const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({user: req.user._id});

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
  res.status(200).json(skillWithProgress);
});
