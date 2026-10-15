import express from "express";
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUserByAdmin 
} from "../controller/admin.Controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUserByAdmin);

export default router;