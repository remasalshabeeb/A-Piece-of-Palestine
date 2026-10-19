
import express from "express";

import {
  getPendingRevisions,
  reviewRevision,
} from "../controller/contentRevision.Controller.js";

import {
  verifyToken,
  verifyAdmin,
} from "../middleware/auth.Middleware.js";

const router = express.Router();

// عرض التعديلات التي تنتظر المراجعة.
router.get(
  "/pending",
  verifyToken,
  verifyAdmin,
  getPendingRevisions
);

// الموافقة على التعديل أو رفضه.
router.patch(
  "/:id/review",
  verifyToken,
  verifyAdmin,
  reviewRevision
);

export default router;
