
import mongoose from "mongoose";
import Stage from "../models/stage.Model.js";
import Question from "../models/question.Model.js";
import Category from "../models/category.Model.js";
import ContentRevision from "../models/contentRevision.Model.js";

const isAdmin = (req) => req.user?.role === "admin";

const canManageStage = (req, stage) =>
  isAdmin(req) || stage.createdBy.toString() === req.user.id;

/**
 * Checks whether a stage has exactly four approved, active questions
 * with four distinct, non-empty puzzle piece IDs.
 *
 * This function does not publish or modify the stage.
 */

const isStageReadyForPlayers = async (stageId) => {
  const questions = await Question.find({
    stageId,
    isActive: true,
  })
    .select("pieceId")
    .lean();

  // يجب أن تحتوي المرحلة على أربعة أسئلة نشطة بالضبط.
  if (questions.length !== 4) {
    return false;
  }

  // يجب أن يكون لكل سؤال معرّف قطعة غير فارغ.
  const pieceIds = questions.map((question) =>
    typeof question.pieceId === "string"
      ? question.pieceId.trim()
      : ""
  );

  if (pieceIds.some((pieceId) => !pieceId)) {
    return false;
  }

  // يجب أن تكون القطع الأربع مختلفة.
  return new Set(pieceIds).size === 4;
};

const validateStageData = async (data, partial = false) => {
  const {
    title,
    description,
    difficulty,
    categoryId,
    order,
    image,
    pieceId,
  } = data;

  if (!partial || title !== undefined) {
    if (
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 100
    ) {
      return "Title must be between 3 and 100 characters.";
    }
  }

  if (!partial || description !== undefined) {
    if (
      typeof description !== "string" ||
      !description.trim() ||
      description.trim().length > 1000
    ) {
      return "Description is required and cannot exceed 1000 characters.";
    }
  }

  if (
    difficulty !== undefined &&
    !["easy", "medium", "hard"].includes(difficulty)
  ) {
    return "Difficulty must be easy, medium, or hard.";
  }

  if (
    categoryId !== undefined &&
    categoryId !== null &&
    categoryId !== ""
  ) {
    if (!mongoose.isValidObjectId(categoryId)) {
      return "Invalid category ID.";
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return "Category not found.";
    }
  }

  if (
    order !== undefined &&
    (!Number.isInteger(Number(order)) || Number(order) < 1)
  ) {
    return "Order must be a positive integer.";
  }

  if (
    image !== undefined &&
    (typeof image !== "string" || image.length > 2000)
  ) {
    return "Image must be text and cannot exceed 2000 characters.";
  }

  if (
    pieceId !== undefined &&
    (typeof pieceId !== "string" || pieceId.trim().length > 100)
  ) {
    return "Piece ID must be text and cannot exceed 100 characters.";
  }

  return null;
};

const getStageFields = (data) => {
  const allowedFields = [
    "title",
    "description",
    "difficulty",
    "categoryId",
    "order",
    "image",
    "pieceId",
  ];

  const result = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  }

  if (result.title !== undefined) {
    result.title = result.title.trim();
  }

  if (result.description !== undefined) {
    result.description = result.description.trim();
  }

  if (result.categoryId === "") {
    result.categoryId = null;
  }

  if (result.order !== undefined) {
    result.order = Number(result.order);
  }

  if (result.image !== undefined) {
    result.image = result.image.trim();
  }

  if (result.pieceId !== undefined) {
    result.pieceId = result.pieceId.trim();
  }

  return result;
};

const hasPendingRevision = async (
  contentType,
  contentId,
  submittedBy
) =>
  ContentRevision.exists({
    contentType,
    contentId,
    submittedBy,
    status: "pending",
  });

// Public users see only active, approved, complete stages.
export const getStages = async (req, res) => {
  try {
    const stages = await Stage.find({
      isActive: true,
      approvalStatus: "approved",
    })
      .populate("categoryId", "name")
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Do not expose stages until all four approved questions
    // and four unique puzzle pieces are available.
    const readiness = await Promise.all(
      stages.map(async (stage) => ({
        stageId: stage._id.toString(),
        ready: await isStageReadyForPlayers(stage._id),
      }))
    );

    const readyStageIds = new Set(
      readiness
        .filter((item) => item.ready)
        .map((item) => item.stageId)
    );

    const availableStages = stages.filter((stage) =>
      readyStageIds.has(stage._id.toString())
    );

    return res.status(200).json({
      count: availableStages.length,
      stages: availableStages,
    });
  } catch (error) {
    console.error("Get stages error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Admins see all stages; content managers see their own stages.
export const getManagedStages = async (req, res) => {
  try {
    const filter = isAdmin(req)
      ? {}
      : { createdBy: req.user.id };

    const stages = await Stage.find(filter)
      .populate("categoryId", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const stagesWithReadiness = await Promise.all(
      stages.map(async (stage) => ({
        ...stage,
        isReadyForPlayers: await isStageReadyForPlayers(stage._id),
      }))
    );

    return res.status(200).json({
      count: stagesWithReadiness.length,
      stages: stagesWithReadiness,
    });
  } catch (error) {
    console.error("Get managed stages error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Admins can create stages; content managers submit them for review.
// A stage is not shown to players until its required questions are ready.

export const createStage = async (req, res) => {
  try {
    // Use the uploaded image when provided; otherwise preserve the text value.
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image || "";

    const requestData = {
      ...req.body,
      image: imagePath,
    };

    const validationError = await validateStageData(requestData);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const data = getStageFields(requestData);

    if (isAdmin(req)) {
      const stage = await Stage.create({
        ...data,
        difficulty: data.difficulty || "easy",
        categoryId: data.categoryId ?? null,
        order: data.order ?? 1,
        image: data.image ?? "",
        createdBy: req.user.id,
        approvalStatus: "approved",
        isActive: true,
      });

      const ready = await isStageReadyForPlayers(stage._id);

      return res.status(201).json({
        message: ready
          ? "Stage created and published successfully."
          : "Stage created. It will appear to players after four approved questions with unique puzzle pieces are available.",
        stage,
        isReadyForPlayers: ready,
      });
    }

    const pendingExists = await hasPendingRevision(
      "stage",
      null,
      req.user.id
    );

    if (pendingExists) {
      const matchingRevision = await ContentRevision.findOne({
        contentType: "stage",
        contentId: null,
        submittedBy: req.user.id,
        status: "pending",
        proposedData: data,
      });

      if (matchingRevision) {
        return res.status(409).json({
          message: "You already have this stage awaiting review.",
          revisionId: matchingRevision._id,
        });
      }
    }

    const revision = await ContentRevision.create({
      contentType: "stage",
      contentId: null,
      action: "create",
      proposedData: {
        ...data,
        difficulty: data.difficulty || "easy",
        categoryId: data.categoryId ?? null,
        order: data.order ?? 1,
        image: data.image ?? "",
      },
      submittedBy: req.user.id,
      status: "pending",
    });

    return res.status(201).json({
      message: "New stage submitted for administrator approval.",
      revision,
    });
  } catch (error) {
    console.error("Create stage error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error instanceof Error && error.message.includes("File too large")) {
      return res.status(413).json({
        message: "حجم الصورة يتجاوز الحد المسموح به (5 ميغابايت).",
      });
    }

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};


// Admins update stages directly; content managers submit proposed changes.
export const updateStage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid stage ID.",
      });
    }

    const stage = await Stage.findById(id);

    if (!stage) {
      return res.status(404).json({
        message: "Stage not found.",
      });
    }

    if (!canManageStage(req, stage)) {
      return res.status(403).json({
        message: "You cannot update this stage.",
      });
    }

    const updates = getStageFields(req.body);

    if (isAdmin(req) && req.body.isActive !== undefined) {
      if (typeof req.body.isActive !== "boolean") {
        return res.status(400).json({
          message: "isActive must be true or false.",
        });
      }

      updates.isActive = req.body.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one valid field to update.",
      });
    }

    const mergedData = {
      title: updates.title ?? stage.title,
      description: updates.description ?? stage.description,
      difficulty: updates.difficulty ?? stage.difficulty,
      categoryId:
        updates.categoryId !== undefined
          ? updates.categoryId
          : stage.categoryId,
      order: updates.order ?? stage.order,
      image: updates.image ?? stage.image,
      pieceId: updates.pieceId ?? stage.pieceId,
    };

    const validationError = await validateStageData(mergedData);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    // Prevent an administrator from activating an incomplete stage.
    if (isAdmin(req) && updates.isActive === true) {
      const ready = await isStageReadyForPlayers(stage._id);

      if (!ready) {
        return res.status(400).json({
          message:
            "Cannot activate this stage. It must have exactly four active, approved questions with four unique puzzle pieces.",
        });
      }
    }

    if (!isAdmin(req)) {
      const pendingRevision = await ContentRevision.findOne({
        contentType: "stage",
        contentId: stage._id,
        submittedBy: req.user.id,
        status: "pending",
      });

      if (pendingRevision) {
        return res.status(409).json({
          message:
            "You already have a pending revision for this stage. Wait for the administrator's decision.",
          revisionId: pendingRevision._id,
        });
      }

      const revision = await ContentRevision.create({
        contentType: "stage",
        contentId: stage._id,
        action: "update",
        proposedData: mergedData,
        submittedBy: req.user.id,
        status: "pending",
      });

      return res.status(201).json({
        message: "Stage changes submitted for administrator approval.",
        revision,
      });
    }

    Object.assign(stage, mergedData);

    if (updates.isActive !== undefined) {
      stage.isActive = updates.isActive;
    }

    await stage.save();

    const ready = await isStageReadyForPlayers(stage._id);

    return res.status(200).json({
      message: "Stage updated successfully.",
      stage,
      isReadyForPlayers: ready,
    });
  } catch (error) {
    console.error("Update stage error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Only administrators can delete stages.
export const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid stage ID.",
      });
    }

    const stage = await Stage.findById(id);

    if (!stage) {
      return res.status(404).json({
        message: "Stage not found.",
      });
    }

    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Only administrators can delete stages.",
      });
    }

    await Stage.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Stage deleted successfully.",
    });
  } catch (error) {
    console.error("Delete stage error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
