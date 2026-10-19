
import express from "express";

import {
  getMyProgress,
  getStageProgress,
  submitAnswer,
  completeStage,
} from "../controller/progress.Controller.js";

import { verifyToken } from "../middleware/auth.Middleware.js";

const router = express.Router();

// All progress endpoints require authentication.
router.use(verifyToken);

// View the authenticated player's overall progress.
router.get("/progress/me", getMyProgress);

// View the authenticated player's progress in a stage.
router.get("/progress/stages/:stageId", getStageProgress);

// Submit an answer and calculate points.
router.post("/progress/answers", submitAnswer);

// Complete a stage after answering all active questions.
router.patch("/progress/stages/:stageId/complete", completeStage);

export default router;
