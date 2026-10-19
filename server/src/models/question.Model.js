
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    stageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stage",
      required: [true, "Stage is required"],
      index: true,
    },

    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },

    options: {
      type: [
        {
          type: String,
          required: true,
          trim: true,
        },
      ],
      validate: {
        validator: function (options) {
          return (
            options.length >= 2 &&
            options.every((option) => option.length > 0) &&
            new Set(options).size === options.length
          );
        },
        message:
          "A question must have at least two unique, non-empty options.",
      },
      required: true,
    },

    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
      trim: true,
    },

    points: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },

    order: {
      type: Number,
      default: 1,
      min: 1,
    },

    pieceId: {
  type: String,
  trim: true,
  required: [true, "Puzzle piece ID is required"],
  maxlength: 100,
},

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure that the correct answer is one of the available options.
questionSchema.pre("validate", function () {
  if (
    this.correctAnswer &&
    this.options &&
    !this.options.includes(this.correctAnswer.trim())
  ) {
    this.invalidate(
      "correctAnswer",
      "The correct answer must match one of the options."
    );
  }
});

questionSchema.index({ stageId: 1, order: 1 });

const Question = mongoose.model("Question", questionSchema);

export default Question;
