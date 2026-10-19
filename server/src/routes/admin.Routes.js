
import express from "express";

import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUserByAdmin,
} from "../controller/admin.Controller.js";

import {
  verifyToken,
  verifyAdmin,
} from "../middleware/auth.Middleware.js";

const router = express.Router();

// All routes in this file require a valid token and administrator role.
router.use(verifyToken, verifyAdmin);

// GET /api/admin/users
router.get("/users", getAllUsers);

// PUT /api/admin/users/:id/role
router.put("/users/:id/role", updateUserRole);

// PATCH /api/admin/users/:id/status
router.patch("/users/:id/status", updateUserStatus);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUserByAdmin);

export default router;
