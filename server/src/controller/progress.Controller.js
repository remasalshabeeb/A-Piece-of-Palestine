
import mongoose from "mongoose";
import Progress from "../models/progress.Model.js";
import Stage from "../models/stage.Model.js";
import Question from "../models/question.Model.js";

export const getMyProgress = async (req, res) => {
  try {
    const progressRecords = await Progress.find({
      userId: req.user.id,
    })
      .populate("stageId", "title image difficulty order")
      .sort({ updatedAt: -1 });

    const totalPoints = progressRecords.reduce(
      (sum, record) => sum + record.totalPoints,
      0
    );

    const completedStages = progressRecords.filter(
      (record) => record.isCompleted
    ).length;

    return res.status(200).json({
      totalPoints,
      completedStages,
      progress: progressRecords,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const getStageProgress = async (req, res) => {
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

    const progress = await Progress.findOne({
      userId: req.user.id,
      stageId,
    }).populate(
      "answeredQuestions.questionId",
      "question options points order"
    );

    return res.status(200).json({ progress });
  } catch (error) {
    console.error("Get stage progress error:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { stageId, questionId, answer } = req.body;

    if (
      !mongoose.isValidObjectId(stageId) ||
      !mongoose.isValidObjectId(questionId) ||
      typeof answer !== "string" ||
      !answer.trim()
    ) {
      return res.status(400).json({
        message: "A valid stage ID, question ID, and answer are required.",
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

    const question = await Question.findOne({
      _id: questionId,
      stageId,
      isActive: true,
    });

    if (!question) {
      return res.status(404).json({
        message: "Question not found in this stage.",
      });
    }

    if (!question.pieceId) {
      return res.status(400).json({
        message: "This question has no assigned puzzle piece.",
      });
    }

    let progress = await Progress.findOne({
      userId: req.user.id,
      stageId,
    });

    if (!progress) {
      try {
        progress = await Progress.create({
          userId: req.user.id,
          stageId,
        });
      } catch (error) {
        if (error.code !== 11000) throw error;

        progress = await Progress.findOne({
          userId: req.user.id,
          stageId,
        });

        if (!progress) throw error;
      }
    }

    const previousAnswer = progress.answeredQuestions.find(
      (item) => item.questionId.toString() === questionId
    );

    if (previousAnswer?.isCorrect) {
      return res.status(200).json({
        message: "This question has already been answered correctly.",
        alreadyAnswered: true,
        isCorrect: true,
        pointsAwarded: 0,
        totalPoints: progress.totalPoints,
        pieceId: question.pieceId,
        pieceAlreadyCollected: true,
      });
    }

    const isCorrect =
      answer.trim() === question.correctAnswer.trim();

    let pointsAwarded = 0;
    let pieceCollected = false;

    if (isCorrect) {
      const alreadyCollected = progress.collectedPieces.some(
        (piece) => piece.pieceId === question.pieceId
      );

      if (!alreadyCollected) {
        pointsAwarded = question.points;
        progress.totalPoints += pointsAwarded;

        progress.collectedPieces.push({
          pieceId: question.pieceId,
          collectedAt: new Date(),
        });

        pieceCollected = true;
      }
    }

    if (previousAnswer) {
      previousAnswer.isCorrect = isCorrect;
      previousAnswer.pointsAwarded = pointsAwarded;
      previousAnswer.answeredAt = new Date();
    } else {
      progress.answeredQuestions.push({
        questionId: question._id,
        isCorrect,
        pointsAwarded,
        answeredAt: new Date(),
      });
    }

    await progress.save();

    return res.status(200).json({
      message: isCorrect
        ? "Correct answer! Puzzle piece collected."
        : "Incorrect answer. Try again!",
      alreadyAnswered: false,
      isCorrect,
      pointsAwarded,
      totalPoints: progress.totalPoints,
      pieceId: isCorrect ? question.pieceId : null,
      pieceCollected,
      collectedPieces: progress.collectedPieces.length,
    });
  } catch (error) {
    console.error("Submit answer error:", error);

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

export const completeStage = async (req, res) => {
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

    const activeQuestions = await Question.find({
      stageId,
      isActive: true,
    }).select("_id pieceId");

    if (activeQuestions.length !== 4) {
      return res.status(400).json({
        message: "A stage must have exactly four active questions.",
      });
    }

    const requiredPieceIds = activeQuestions.map(
      (question) => question.pieceId
    );

    if (
      requiredPieceIds.some((pieceId) => !pieceId) ||
      new Set(requiredPieceIds).size !== 4
    ) {
      return res.status(400).json({
        message:
          "Each active question must have a different puzzle piece ID.",
      });
    }

    const progress = await Progress.findOne({
      userId: req.user.id,
      stageId,
    });

    if (!progress) {
      return res.status(400).json({
        message: "Answer the stage questions before completing the stage.",
      });
    }

    if (progress.isCompleted) {
      return res.status(200).json({
        message: "Stage has already been completed.",
        progress,
      });
    }

    const allQuestionsCorrect = activeQuestions.every((question) => {
      const answer = progress.answeredQuestions.find(
        (item) =>
          item.questionId.toString() === question._id.toString()
      );

      return answer?.isCorrect === true;
    });

    if (!allQuestionsCorrect) {
      return res.status(400).json({
        message: "Answer all four questions correctly to complete the stage.",
      });
    }

    const collectedPieceIds = new Set(
      progress.collectedPieces.map((piece) => piece.pieceId)
    );

    const allPiecesCollected = requiredPieceIds.every((pieceId) =>
      collectedPieceIds.has(pieceId)
    );

    if (!allPiecesCollected) {
      return res.status(400).json({
        message: "Collect all four puzzle pieces before completing the stage.",
      });
    }

    progress.isCompleted = true;
    progress.completedAt = new Date();

    await progress.save();

    return res.status(200).json({
      message: "Stage completed successfully!",
      progress,
    });
  } catch (error) {
    console.error("Complete stage error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
