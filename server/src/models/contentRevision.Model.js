
import mongoose from "mongoose";

const contentRevisionSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ["stage", "question"],
      required: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    action: {
      type: String,
      enum: ["create", "update"],
      required: true,
    },

    proposedData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewComment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

contentRevisionSchema.index({ status: 1, createdAt: -1 });
contentRevisionSchema.index({ contentType: 1, contentId: 1 });

const ContentRevision = mongoose.model(
  "ContentRevision",
  contentRevisionSchema
);

export default ContentRevision;
