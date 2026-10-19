
import express from "express";

import {
  createContactMessage,
  getApprovedContactMessages,
  getPendingContactMessages,
  reviewContactMessage,
} from "../controller/contact.Controller.js";

import {
  verifyToken,
  verifyAdmin,
} from "../middleware/auth.Middleware.js";

const router = express.Router();

// Public: submit a contact message without requiring login.
router.post("/contact", createContactMessage);

// Public: show approved messages on the homepage.
router.get("/contact/approved", getApprovedContactMessages);

// Admin: view messages awaiting review.
router.get(
  "/admin/contact/pending",
  verifyToken,
  verifyAdmin,
  getPendingContactMessages
);

// Admin: approve or reject a message.
router.patch(
  "/admin/contact/:id/review",
  verifyToken,
  verifyAdmin,
  reviewContactMessage
);

export default router;
