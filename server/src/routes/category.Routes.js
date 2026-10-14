import express from "express"
import { gerAllCategories , createCategory } from "../controller/category.Controller.js"
import { verifyToken, verifyAdmin } from "../middleware/auth.Middleware.js";

const router = express.Router()

router.get("/Categories", gerAllCategories)
router.post("/Category", createCategory);

export default router