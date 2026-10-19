
import express from "express";

import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from "../controller/category.Controller.js";

import {
  verifyToken,
  verifyAdmin,
} from "../middleware/auth.Middleware.js";

const router = express.Router();

// View all categories
router.get("/Categories", getAllCategories);

// Only administrators can create categories
router.post("/Category", verifyToken, verifyAdmin, createCategory);

// Only administrators can delete categories
router.delete("/Category/:id", verifyToken, verifyAdmin, deleteCategory);

export default router;
