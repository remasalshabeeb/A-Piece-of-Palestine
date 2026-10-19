
import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stage",
      required: true,
    },

    answeredQuestions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },

        isCorrect: {
          type: Boolean,
          required: true,
        },

        pointsAwarded: {
          type: Number,
          default: 0,
          min: 0,
        },

        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    collectedPieces: [
      {
        pieceId: {
          type: String,
          required: true,
          trim: true,
        },

        collectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One progress record per user per stage.
progressSchema.index(
  { userId: 1, stageId: 1 },
  { unique: true }
);

// Prevent the same question from being recorded twice
// within the same progress document.
progressSchema.path("answeredQuestions").validate(function (questions) {
  const questionIds = questions.map((item) =>
    item.questionId?.toString()
  );

  return new Set(questionIds).size === questionIds.length;
}, "A question cannot be recorded more than once.");

// Prevent collecting the same piece twice
// within the same progress document.
progressSchema.path("collectedPieces").validate(function (pieces) {
  const pieceIds = pieces.map((item) => item.pieceId);

  return new Set(pieceIds).size === pieceIds.length;
}, "A piece cannot be collected more than once.");

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
