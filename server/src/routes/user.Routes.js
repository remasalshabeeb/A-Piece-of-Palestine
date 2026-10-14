import express from "express";
import { 
  getAllUsers, 
  getUserById, 
  getUserByEmail, 
  updateUser, 
  changePassword, 
  deleteUser, 
  updateUserRole 
} from "../controller/user.Controller.js";
import { verifyToken as protect, verifyAdmin as adminOnly } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.get("/users", adminOnly, getAllUsers);
router.get("/user/:id", protect, getUserById);
router.get("/user-email", protect, getUserByEmail); // سنضيف هذه الدالة للـ Controller
router.put("/user/:id", protect, updateUser);
router.put("/change-password/:id", protect, changePassword); // وسنضيف هذه أيضاً
router.delete("/user/:id", protect, deleteUser);
router.put("/update-user-role/:id", protect, adminOnly, updateUserRole); // وسنضيف هذه للأدمن

export default router;