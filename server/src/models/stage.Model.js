
import mongoose from "mongoose";

const stageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Stage title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Stage description is required"],
      trim: true,
      maxlength: 1000,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    order: {
      type: Number,
      default: 1,
      min: 1,
    },

    pieceId: {
  type: String,
  trim: true,
  default: "",
},

    isActive: {
      type: Boolean,
      default: true,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

stageSchema.index({ categoryId: 1, order: 1 });
stageSchema.index({ approvalStatus: 1, isActive: 1 });

const Stage = mongoose.model("Stage", stageSchema);

export default Stage;
