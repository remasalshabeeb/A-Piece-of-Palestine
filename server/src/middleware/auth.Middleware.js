
import jwt from "jsonwebtoken";
import User from "../models/user.Model.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");

      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify that the account still exists and is active.
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Account no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated.",
      });
    }

    // Use the current database role, not the potentially outdated JWT role.
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token.",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Admins only.",
  });
};

export const verifyContentManager = (req, res, next) => {
  if (req.user?.role === "contentManager") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Content managers only.",
  });
};

export const verifyAdminOrContentManager = (req, res, next) => {
  if (
    req.user?.role === "admin" ||
    req.user?.role === "contentManager"
  ) {
    return next();
  }

  return res.status(403).json({
    message: "Access denied.",
  });
};
