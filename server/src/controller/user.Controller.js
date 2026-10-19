
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.Model.js";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const isAdmin = (req) => req.user?.role === "admin";

const canAccessUser = (req, userId) =>
  isAdmin(req) || req.user?.id === userId;

const safeUserFields =
  "-hashed_password";

export const getAllUsers = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Admins only.",
      });
    }

    const users = await User.find()
      .select(safeUserFields)
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

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (!canAccessUser(req, id)) {
      return res.status(403).json({
        message: "You can only access your own account.",
      });
    }

    const user = await User.findById(id).select(safeUserFields);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Please provide an email query.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Only administrators may search for arbitrary users by email.
    if (!isAdmin(req) && cleanEmail !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        message: "You can only access your own account.",
      });
    }

    const user = await User.findOne({
      email: cleanEmail,
    }).select(safeUserFields);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by email error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (!canAccessUser(req, id)) {
      return res.status(403).json({
        message: "You can only update your own account.",
      });
    }

    const updatedData = {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 3 ||
        name.trim().length > 100
      ) {
        return res.status(400).json({
          message: "Name must be between 3 and 100 characters.",
        });
      }

      updatedData.name = name.trim();
    }

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res.status(400).json({
          message: "Please provide a valid email address.",
        });
      }

      updatedData.email = email.trim().toLowerCase();
    }

    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== "string") {
        return res.status(400).json({
          message: "Phone number must be a string.",
        });
      }

      updatedData.phoneNumber = phoneNumber.trim();
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select(safeUserFields);

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (req.user.id !== id) {
      return res.status(403).json({
        message: "You can only change your own password.",
      });
    }

    if (
      typeof oldPassword !== "string" ||
      typeof newPassword !== "string" ||
      !oldPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Please provide the old and new passwords.",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters and include uppercase and lowercase letters, a number, and a special character.",
      });
    }

    const user = await User.findById(id).select("+hashed_password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.hashed_password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect old password.",
      });
    }

    user.hashed_password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    // Regular users may delete only their own accounts.
    // Administrators should use the dedicated admin endpoint.
    if (req.user.id !== id) {
      return res.status(403).json({
        message: "You can only delete your own account.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          message: "You cannot delete the last active administrator.",
        });
      }
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Keep role changes in admin.Controller.js only.
export const updateUserRole = async (req, res) => {
  return res.status(403).json({
    message: "Role changes are available only through the admin API.",
  });
};
