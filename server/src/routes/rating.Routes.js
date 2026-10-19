
import express from "express";

import {
  createRating,
  getApprovedRatings,
  getPendingRatings,
  reviewRating,
} from "../controller/rating.Controller.js";

import {
  verifyToken,
  verifyAdmin,
} from "../middleware/auth.Middleware.js";

const router = express.Router();

// المستخدم المسجل يستطيع إرسال تقييم.
router.post("/", verifyToken, createRating);

// عرض التقييمات المعتمدة فقط.
router.get("/approved", getApprovedRatings);

// الأدمن فقط يستطيع مشاهدة التقييمات المعلقة.
router.get(
  "/pending",
  verifyToken,
  verifyAdmin,
  getPendingRatings
);

// الأدمن فقط يستطيع اعتماد التقييم أو رفضه.
router.patch(
  "/:id/review",
  verifyToken,
  verifyAdmin,
  reviewRating
);

export default router;
