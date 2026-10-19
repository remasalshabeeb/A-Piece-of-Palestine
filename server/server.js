
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDb } from "./src/config/db.js";

import CategoriesRoutes from "./src/routes/category.Routes.js";
import authRoutes from "./src/routes/auth.Routes.js";
import userRoutes from "./src/routes/user.Routes.js";
import adminRoutes from "./src/routes/admin.Routes.js";
import stageRoutes from "./src/routes/stage.Routes.js";
import questionRoutes from "./src/routes/question.Routes.js";
import progressRoutes from "./src/routes/progress.Routes.js";
import contactRoutes from "./src/routes/contact.Routes.js";
import contentRevisionRoutes from "./src/routes/contentRevision.Routes.js";
import ratingRoutes from "./src/routes/rating.Routes.js";


dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.get("/H", (req, res) => {
  res.send("The server is healthy and working well - A Piece of Palestine");
});

// Public contact routes must come before other routers mounted at /api.
app.use("/api", contactRoutes);

app.use("/api", CategoriesRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", stageRoutes);
app.use("/api", questionRoutes);
app.use("/api", progressRoutes);
app.use("/api/content-revisions", contentRevisionRoutes);app.use("/api/ratings", ratingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON request body.",
    });
  }

  return res.status(500).json({
    message: "Internal server error.",
  });
});

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is missing from the environment.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from the environment.");
    }

    await connectDb();

    const port = Number(process.env.PORT) || 2905;

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
