import express from "express";
import { login,
  register,
  updateMyName,
  updateMyPassword,
  deleteMyAccount, } from "../controller/auth.Controller.js";
import { verifyToken } from "../middleware/auth.Middleware.js";

const router =express.Router();
router.post('/auth/register', register);
router.post('/auth/login', login);
router.patch("/auth/me/name", verifyToken, updateMyName);
router.patch("/auth/me/password", verifyToken, updateMyPassword);
router.delete("/auth/me", verifyToken, deleteMyAccount);

export default router;