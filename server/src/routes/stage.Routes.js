
import express from "express";
import upload from "../middleware/upload.Middleware.js";

import {
  getStages,
  getManagedStages,
  createStage,
  updateStage,
  deleteStage,
} from "../controller/stage.Controller.js";

import {
  verifyToken,
  verifyAdmin,
  verifyAdminOrContentManager,
} from "../middleware/auth.Middleware.js";

const router = express.Router();

// Public: view published stages
router.get("/stages", getStages);

// Admin and content manager: view stages for management
router.get(
  "/stages/manage",
  verifyToken,
  verifyAdminOrContentManager,
  getManagedStages
);

// Admin and content manager: submit a new stage
router.post(
  "/stages",
  verifyToken,
  verifyAdminOrContentManager,
  upload.single("image"),
  createStage
);

// Protected update endpoint; controller applies additional permission checks
router.put(
  "/stages/:id",
  verifyToken,
  verifyAdminOrContentManager,
  updateStage
);

// Only administrators can delete stages
router.delete(
  "/stages/:id",
  verifyToken,
  verifyAdmin,
  deleteStage
);

export default router;
