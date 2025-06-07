import User from "../models/user.model.js";
import Prescription from "../models/prescription.model.js";
import Report from "../models/report.model.js";
import Member from "../models/member.model.js";

/**
 * Get current user profile (excluding password)
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Update user profile (except aadhar and password)
 */


export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, dob } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (dob) user.dob = dob;

    // Do not update aadhar or password here for security reasons

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      aadhar: updatedUser.aadhar,
      bloodGroup: updatedUser.bloodGroup,
      dob: updatedUser.dob,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Get user dashboard summary (counts of prescriptions, reports, members)
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const [prescriptionCount, reportCount, memberCount] = await Promise.all([
      Prescription.countDocuments({ user: req.user._id }),
      Report.countDocuments({ user: req.user._id }),
      Member.countDocuments({ userId: req.user._id })
    ]);

    res.status(200).json({
      prescriptionCount,
      reportCount,
      memberCount,
      user: {
        name: req.user.name,
        bloodGroup: req.user.bloodGroup
      }
    });
  } catch (error) {
    console.error("Error in getDashboardSummary controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const { userId, profilePic } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!profilePic || !profilePic.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    user.profilePic = profilePic;
    await user.save();

    return res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.error("❌ Error updating profile image:", error);
    return res.status(500).json({ message: "Error updating profile picture" });
  }
};
