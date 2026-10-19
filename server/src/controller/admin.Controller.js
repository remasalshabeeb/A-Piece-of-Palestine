
import mongoose from "mongoose";
import User from "../models/user.Model.js";

const allowedRoles = ["admin", "contentManager", "user"];

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-hashed_password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Role must be admin, contentManager, or user.",
      });
    }

    // Prevent accidentally removing the last active admin.
    if (role !== "admin" && req.user.id === id) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          message: "You cannot remove the last active administrator.",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-hashed_password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User role updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false.",
      });
    }

    if (!isActive && req.user.id === id) {
      return res.status(400).json({
        message: "You cannot deactivate your own account.",
      });
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!isActive && targetUser.role === "admin" && targetUser.isActive) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          message: "You cannot deactivate the last active administrator.",
        });
      }
    }

    targetUser.isActive = isActive;
    await targetUser.save();

    const safeUser = targetUser.toObject();
    delete safeUser.hashed_password;

    return res.status(200).json({
      message: isActive
        ? "User account activated successfully."
        : "User account deactivated successfully.",
      user: safeUser,
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (req.user.id === id) {
      return res.status(400).json({
        message: "You cannot delete your own account here.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
