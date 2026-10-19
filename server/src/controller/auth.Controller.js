
import bcrypt from "bcryptjs";
import User from "../models/user.Model.js";
import jwt from "jsonwebtoken";



const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Please enter all required fields.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 3 || cleanName.length > 100) {
      return res.status(400).json({
        message: "Name must be between 3 and 100 characters.",
      });
    }

    if (
  cleanEmail.length > 254 ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
) {
  return res.status(400).json({
    message: "Please enter a valid email address.",
  });
}

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase and lowercase letters, a number, and a special character.",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists!",
      });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      hashed_password,
      phoneNumber:
        typeof phoneNumber === "string" ? phoneNumber.trim() : "",
      role: "user",
      isActive: true,
    });

    return res.status(201).json({
      message: "Account created successfully! Please login.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists!",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter your email and password to login.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables.");

      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Password hashes are excluded by default in user.Model.js.
    // Explicitly request the hash for password verification.
    const user = await User.findOne({
      email: cleanEmail,
    }).select("+hashed_password");

    if (!user) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "This account has been deactivated.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.hashed_password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "20m",
      }
    );

    return res.status(200).json({
      message: "Logged in successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
      },
      tokens: token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const updateMyName = async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Please enter a valid name.",
      });
    }

    const cleanName = name.trim();

    if (cleanName.length < 3 || cleanName.length > 100) {
      return res.status(400).json({
        message: "Name must be between 3 and 100 characters.",
      });
    }

    
const user = await User.findByIdAndUpdate(
  req.user.id,
  { $set: { name: cleanName } },
  { returnDocument: "after", runValidators: true }
);


    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Name updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update name error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Please fill in all password fields.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "The new password must differ from the current password.",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase and lowercase letters, a number, and a special character.",
      });
    }

    const user = await User.findById(req.user.id).select(
      "+hashed_password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.hashed_password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect.",
      });
    }

    user.hashed_password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Update password error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const deleteMyAccount = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Please enter your password to confirm account deletion.",
      });
    }

    if (confirmation !== "DELETE") {
      return res.status(400).json({
        message: 'Please type "DELETE" to confirm account deletion.',
      });
    }

    const user = await User.findById(req.user.id).select(
      "+hashed_password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.hashed_password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Password is incorrect.",
      });
    }

    await User.findByIdAndDelete(req.user.id);

    return res.status(200).json({
      message: "Your account has been deleted successfully.",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
