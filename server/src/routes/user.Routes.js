
import express from "express";

import {
  getUserById,
  getUserByEmail,
  updateUser,
  changePassword,
  deleteUser,
} from "../controller/user.Controller.js";

import {
  verifyToken,
} from "../middleware/auth.Middleware.js";

const router = express.Router();

// All user routes require authentication.
router.use(verifyToken);

// Get a user's own profile (or another profile if the requester is an admin).
router.get("/user/:id", getUserById);

// Find the current user's profile by email.
// Administrators may also search for another user's email.
router.get("/user-email", getUserByEmail);

// Update profile information; role changes are not allowed here.
router.put("/user/:id", updateUser);

// Change the password of the authenticated user's own account.
router.put("/change-password/:id", changePassword);

// Delete the authenticated user's own account.
router.delete("/user/:id", deleteUser);

export default router;
