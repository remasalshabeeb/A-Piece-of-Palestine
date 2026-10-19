
import mongoose from "mongoose";
import Question from "../models/question.Model.js";
import Stage from "../models/stage.Model.js";
import ContentRevision from "../models/contentRevision.Model.js";

const isAdmin = (req) => req.user?.role === "admin";

const validateQuestionData = async (data) => {
  const {
    stageId,
    question,
    options,
    correctAnswer,
    points,
    order,
    pieceId,
  } = data;

  if (!mongoose.isValidObjectId(stageId)) {
    return "A valid stage ID is required.";
  }

  const stage = await Stage.findById(stageId);

  if (!stage) {
    return "Stage not found.";
  }

  if (
    typeof question !== "string" ||
    question.trim().length < 3 ||
    question.trim().length > 1000
  ) {
    return "Question must be between 3 and 1000 characters.";
  }

  if (
    !Array.isArray(options) ||
    options.length < 2 ||
    options.some(
      (option) =>
        typeof option !== "string" ||
        !option.trim() ||
        option.trim().length > 300
    ) ||
    new Set(options.map((option) => option.trim())).size !==
      options.length
  ) {
    return "Provide at least two unique, non-empty options (maximum 300 characters each).";
  }

  if (
    typeof correctAnswer !== "string" ||
    !correctAnswer.trim() ||
    !options.some(
      (option) =>
        typeof option === "string" &&
        option.trim() === correctAnswer.trim()
    )
  ) {
    return "The correct answer must match one of the options.";
  }

  if (
    !Number.isInteger(Number(points)) ||
    Number(points) < 1 ||
    Number(points) > 100
  ) {
    return "Points must be an integer between 1 and 100.";
  }

  if (!Number.isInteger(Number(order)) || Number(order) < 1) {
    return "Order must be a positive integer.";
  }

  if (
    typeof pieceId !== "string" ||
    !pieceId.trim() ||
    pieceId.trim().length > 100
  ) {
    return "A valid puzzle piece ID is required (maximum 100 characters).";
  }

  return null;
};

const validateUniquePieceId = async (
  stageId,
  pieceId,
  excludeQuestionId = null
) => {
  const filter = { stageId, pieceId };

  if (excludeQuestionId) {
    filter._id = { $ne: excludeQuestionId };
  }

  const existingQuestion = await Question.findOne(filter).select("_id");

  if (existingQuestion) {
    return "This puzzle piece ID is already used in another question in this stage.";
  }

  return null;
};

const normalizeQuestionData = (data) => ({
  stageId: data.stageId,
  question: data.question.trim(),
  options: data.options.map((option) => option.trim()),
  correctAnswer: data.correctAnswer.trim(),
  points: data.points === undefined ? 10 : Number(data.points),
  order: data.order === undefined ? 1 : Number(data.order),
  pieceId: data.pieceId.trim(),
});

const getMergedQuestionData = (updates, existingQuestion) => ({
  stageId: updates.stageId ?? existingQuestion.stageId.toString(),
  question: updates.question ?? existingQuestion.question,
  options: updates.options ?? existingQuestion.options,
  correctAnswer:
    updates.correctAnswer ?? existingQuestion.correctAnswer,
  points: updates.points ?? existingQuestion.points,
  order: updates.order ?? existingQuestion.order,
  pieceId: updates.pieceId ?? existingQuestion.pieceId,
});

const isStageOwnerOrAdmin = (req, stage) =>
  isAdmin(req) || stage.createdBy.toString() === req.user.id;

// Public users can view questions only for published stages.
// Correct answers are never returned by these endpoints.
export const getQuestionsByStage = async (req, res) => {
  try {
    const { stageId } = req.params;

    if (!mongoose.isValidObjectId(stageId)) {
      return res.status(400).json({
        message: "Invalid stage ID.",
      });
    }

    const stage = await Stage.findOne({
      _id: stageId,
      isActive: true,
      approvalStatus: "approved",
    });

    if (!stage) {
      return res.status(404).json({
        message: "Published stage not found.",
      });
    }

    const questions = await Question.find({
      stageId,
      isActive: true,
    })
      .select("-correctAnswer")
      .sort({ order: 1 });

    return res.status(200).json({
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Get questions error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Admins can see all questions; content managers can see questions
// only in stages they created.
export const getManagedQuestionsByStage = async (req, res) => {
  try {
    const { stageId } = req.params;

    if (!mongoose.isValidObjectId(stageId)) {
      return res.status(400).json({
        message: "Invalid stage ID.",
      });
    }

    const stage = await Stage.findById(stageId);

    if (!stage) {
      return res.status(404).json({
        message: "Stage not found.",
      });
    }

    if (!isStageOwnerOrAdmin(req, stage)) {
      return res.status(403).json({
        message: "You cannot manage questions for this stage.",
      });
    }

    const questions = await Question.find({ stageId }).sort({
      order: 1,
    });

    return res.status(200).json({
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Get managed questions error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Admins create active questions directly.
// Content managers submit new questions for administrator review.
export const createQuestion = async (req, res) => {
  try {
    const input = {
      ...req.body,
      points: req.body.points === undefined ? 10 : req.body.points,
      order: req.body.order === undefined ? 1 : req.body.order,
    };

    const validationError = await validateQuestionData(input);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const data = normalizeQuestionData(input);
    const stage = await Stage.findById(data.stageId);

    if (!stage) {
      return res.status(404).json({
        message: "Stage not found.",
      });
    }

    if (!isStageOwnerOrAdmin(req, stage)) {
      return res.status(403).json({
        message: "You cannot add questions to this stage.",
      });
    }

    const pieceError = await validateUniquePieceId(
      data.stageId,
      data.pieceId
    );

    if (pieceError) {
      return res.status(409).json({
        message: pieceError,
      });
    }

    if (!isAdmin(req)) {
      if (stage.approvalStatus === "rejected" || !stage.isActive) {
        return res.status(400).json({
          message:
            "You can only submit questions for an active, approved stage.",
        });
      }

      const existingPendingRevision = await ContentRevision.findOne({
        contentType: "question",
        contentId: null,
        submittedBy: req.user.id,
        status: "pending",
        "proposedData.stageId": data.stageId,
        "proposedData.question": data.question,
      });

      if (existingPendingRevision) {
        return res.status(409).json({
          message: "This question is already awaiting review.",
          revisionId: existingPendingRevision._id,
        });
      }

      const revision = await ContentRevision.create({
        contentType: "question",
        contentId: null,
        action: "create",
        proposedData: data,
        submittedBy: req.user.id,
        status: "pending",
      });

      return res.status(201).json({
        message: "Question submitted for administrator approval.",
        revision,
      });
    }

    const question = await Question.create({
      ...data,
      isActive: true,
    });

    return res.status(201).json({
      message: "Question created and published successfully.",
      question,
    });
  } catch (error) {
    console.error("Create question error:", error);

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

// Admins update questions directly.
// Content managers submit proposed changes without changing the live question.
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid question ID.",
      });
    }

    const existingQuestion = await Question.findById(id);

    if (!existingQuestion) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    const stage = await Stage.findById(existingQuestion.stageId);

    if (!stage) {
      return res.status(404).json({
        message: "Associated stage not found.",
      });
    }

    if (!isStageOwnerOrAdmin(req, stage)) {
      return res.status(403).json({
        message: "You cannot update this question.",
      });
    }

    const allowedFields = [
      "stageId",
      "question",
      "options",
      "correctAnswer",
      "points",
      "order",
      "pieceId",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

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

    const mergedData = getMergedQuestionData(
      updates,
      existingQuestion
    );

    const normalizedData = normalizeQuestionData(mergedData);
    const validationError = await validateQuestionData(normalizedData);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const pieceError = await validateUniquePieceId(
      normalizedData.stageId,
      normalizedData.pieceId,
      existingQuestion._id
    );

    if (pieceError) {
      return res.status(409).json({
        message: pieceError,
      });
    }

    if (!isAdmin(req)) {
      const targetStage = await Stage.findById(normalizedData.stageId);

      if (!targetStage || !isStageOwnerOrAdmin(req, targetStage)) {
        return res.status(403).json({
          message:
            "You can only submit changes for stages you manage.",
        });
      }

      const existingRevision = await ContentRevision.findOne({
        contentType: "question",
        contentId: existingQuestion._id,
        submittedBy: req.user.id,
        status: "pending",
      });

      if (existingRevision) {
        return res.status(409).json({
          message:
            "A revision for this question is already awaiting review.",
          revisionId: existingRevision._id,
        });
      }

      const revision = await ContentRevision.create({
        contentType: "question",
        contentId: existingQuestion._id,
        action: "update",
        proposedData: normalizedData,
        submittedBy: req.user.id,
        status: "pending",
      });

      return res.status(201).json({
        message: "Question changes submitted for administrator approval.",
        revision,
      });
    }

    Object.assign(existingQuestion, normalizedData);

    if (updates.isActive !== undefined) {
      existingQuestion.isActive = updates.isActive;
    }

    await existingQuestion.save();

    return res.status(200).json({
      message: "Question updated successfully.",
      question: existingQuestion,
    });
  } catch (error) {
    console.error("Update question error:", error);

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

// Only administrators can delete questions.
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid question ID.",
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Only administrators can delete questions.",
      });
    }

    await Question.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Question deleted successfully.",
    });
  } catch (error) {
    console.error("Delete question error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
