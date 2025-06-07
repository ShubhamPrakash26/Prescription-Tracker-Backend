import Member from "../models/member.model.js";
import mongoose from "mongoose";

// Add a new family member
export const addMember = async (req, res) => {
  try {
    const { name, age, gender, relationship } = req.body;

    if (!name || !relationship) {
      return res.status(400).json({ message: "Name and relationship are required" });
    }

    // Generate a unique memberId (8-char hex string)
    const memberId = new mongoose.Types.ObjectId().toString().slice(-8);

    const newMember = new Member({
      userId: req.user._id, // Assume req.user is set by protectRoute middleware
      name,
      age,
      gender,
      relationship,
      memberId
    });

    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (error) {
    console.error("Error in addMember controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all family members for the authenticated user
export const getMembers = async (req, res) => {
  try {
    const members = await Member.find({ userId: req.user._id });
    res.status(200).json(members);
  } catch (error) {
    console.error("Error in getMembers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get a specific member by ID (for the authenticated user)
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json(member);
  } catch (error) {
    console.error("Error in getMemberById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a member's details
export const updateMember = async (req, res) => {
  try {
    const { name, age, gender, relationship } = req.body;

    const member = await Member.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (name) member.name = name;
    if (age !== undefined) member.age = age;
    if (gender) member.gender = gender;
    if (relationship) member.relationship = relationship;

    const updatedMember = await member.save();
    res.status(200).json(updatedMember);
  } catch (error) {
    console.error("Error in updateMember controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a member
export const deleteMember = async (req, res) => {
  const { id } = req.params;

  try {
    let deleted;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Member.deleteOne({
        _id: id,
        userId: req.user._id
      });
    }

    
    if (!deleted || deleted.deletedCount === 0) {
      deleted = await Member.deleteOne({
        memberId: id,
        userId: req.user._id
      });
    }

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "Member not found or not authorized" });
    }

    return res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMember controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
