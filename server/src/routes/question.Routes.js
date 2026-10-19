
import express from "express";

import {
  getQuestionsByStage,
  getManagedQuestionsByStage,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controller/question.Controller.js";

import {
  verifyToken,
  verifyAdmin,
  verifyAdminOrContentManager,
} from "../middleware/auth.Middleware.js";

const router = express.Router();

// Public: view questions for a published stage.
// Correct answers are excluded by the controller.
router.get(
  "/stages/:stageId/questions",
  getQuestionsByStage
);

// Admin and content manager: view questions for management.
router.get(
  "/stages/:stageId/questions/manage",
  verifyToken,
  verifyAdminOrContentManager,
  getManagedQuestionsByStage
);

// Admin and content manager: add questions.
router.post(
  "/questions",
  verifyToken,
  verifyAdminOrContentManager,
  createQuestion
);

// Only admins can directly update questions.
router.put(
  "/questions/:id",
  verifyToken,
  verifyAdminOrContentManager,
  updateQuestion
);

// Only admins can delete questions.
router.delete(
  "/questions/:id",
  verifyToken,
  verifyAdmin,
  deleteQuestion
);

export default router;
