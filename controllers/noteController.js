import Note from "../models/noteModel.js";
import asyncHandler from "express-async-handler";

export const addNote = asyncHandler(async (req, res) => {
  const {title, content} = req.body;
  const note = await Note.create({user: req.user._id, title, content});
  res.status(201).json(note);
});

// Get all notes
export const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({user: req.user._id});
  res.status(200).json(notes);
});

// Get single note
export const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({_id: req.params.id, user: req.user._id});
  if (!note) {
    return res.status(404).json({message: "Note not found"});
  }
  res.status(200).json(note);
});

// Update note
export const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findByIdAndUpdate(
    {_id: req.params.id, user: req.user._id},
    req.body,
    {
      new: true,
    },
  );
  if (!note) {
    return res.status(404).json({message: "Note not found"});
  }
  res.status(200).json(note);
});

// Delete note
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findByIdAndDelete({
    _id: req.params.id,
    user: req.usre._id,
  });

  if (!note) {
    return res.status(404).json({message: "Note not found"});
  }
  res.status(200).json({message: "Note deleted successfully"});
});
