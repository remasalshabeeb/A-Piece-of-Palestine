
import mongoose from "mongoose";
import ContentRevision from "../models/contentRevision.Model.js";
import Stage from "../models/stage.Model.js";
import Question from "../models/question.Model.js";

const getAllowedData = (contentType, data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const fields =
    contentType === "stage"
? [
    "title",
    "description",
    "difficulty",
    "categoryId",
    "order",
    "image",
    "pieceId",
  ]      : [
          "stageId",
          "question",
          "options",
          "correctAnswer",
          "points",
          "order",
          "pieceId",

        ];

  const result = {};

  for (const field of fields) {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  }

  return result;
};

export const getPendingRevisions = async (req, res) => {
  try {
    const revisions = await ContentRevision.find({ status: "pending" })
      .populate("submittedBy", "name email role")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      count: revisions.length,
      revisions,
    });
  } catch (error) {
    console.error("Get pending revisions error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const reviewRevision = async (req, res) => {
  const { id } = req.params;
  const { decision, reviewComment } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid revision ID.",
    });
  }

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({
      message: "Decision must be approved or rejected.",
    });
  }

  if (
    reviewComment !== undefined &&
    (typeof reviewComment !== "string" ||
      reviewComment.trim().length > 2000)
  ) {
    return res.status(400).json({
      message: "Review comment must be text up to 2000 characters.",
    });
  }

  let session;

  try {
    session = await mongoose.startSession();

    let result = null;
    let failure = null;

    await session.withTransaction(async () => {
      const revision = await ContentRevision.findOne({
        _id: id,
        status: "pending",
      }).session(session);

      if (!revision) {
        failure = {
          status: 404,
          message:
            "Pending revision not found. It may already have been reviewed.",
        };
        return;
      }

      if (decision === "approved") {
        const data = getAllowedData(
          revision.contentType,
          revision.proposedData
        );

        if (!data) {
          failure = {
            status: 400,
            message: "Revision data is invalid.",
          };
          return;
        }

        if (
          revision.action === "create" &&
          revision.contentType === "stage"
        ) {
          const stage = new Stage({
            ...data,
            createdBy: revision.submittedBy,
            approvalStatus: "approved",
            isActive: true,
          });

          await stage.save({ session });
        } else if (
          revision.action === "update" &&
          revision.contentType === "stage"
        ) {
          if (!revision.contentId) {
            failure = {
              status: 400,
              message: "The stage revision has no content ID.",
            };
            return;
          }

          const stage = await Stage.findById(
            revision.contentId
          ).session(session);

          if (!stage) {
            failure = {
              status: 404,
              message: "Stage not found.",
            };
            return;
          }

          Object.assign(stage, data);
          stage.approvalStatus = "approved";
          stage.isActive = true;

          await stage.save({ session });
        } else if (
          revision.action === "create" &&
          revision.contentType === "question"
        ) {
          const stageId = data.stageId;

          if (!mongoose.isValidObjectId(stageId)) {
            failure = {
              status: 400,
              message: "Invalid stage ID in question revision.",
            };
            return;
          }

          const stage = await Stage.findOne({
            _id: stageId,
            isActive: true,
            approvalStatus: "approved",
          }).session(session);

          if (!stage) {
            failure = {
              status: 400,
              message:
                "The question's stage must be active and approved.",
            };
            return;
          }

          const question = new Question({
            ...data,
            isActive: true,
          });

          await question.save({ session });
        } else if (
          revision.action === "update" &&
          revision.contentType === "question"
        ) {
          if (!revision.contentId) {
            failure = {
              status: 400,
              message: "The question revision has no content ID.",
            };
            return;
          }

          const question = await Question.findById(
            revision.contentId
          ).session(session);

          if (!question) {
            failure = {
              status: 404,
              message: "Question not found.",
            };
            return;
          }

          const targetStageId = data.stageId ?? question.stageId;

          const targetStage = await Stage.findOne({
            _id: targetStageId,
            isActive: true,
            approvalStatus: "approved",
          }).session(session);

          if (!targetStage) {
            failure = {
              status: 400,
              message:
                "The question's stage must be active and approved.",
            };
            return;
          }

          Object.assign(question, data);
          question.isActive = true;

          await question.save({ session });
        } else {
          failure = {
            status: 400,
            message: "Unsupported revision action or content type.",
          };
          return;
        }
      }

      revision.status = decision;
      revision.reviewedBy = req.user.id;
      revision.reviewedAt = new Date();
      revision.reviewComment = reviewComment?.trim() || "";

      await revision.save({ session });

      result = {
        id: revision._id,
        status: revision.status,
        contentType: revision.contentType,
        action: revision.action,
        reviewedAt: revision.reviewedAt,
      };
    });

    if (failure) {
      return res.status(failure.status).json({
        message: failure.message,
      });
    }

    return res.status(200).json({
      message: `Revision ${decision} successfully.`,
      revision: result,
    });
  } catch (error) {
    console.error("Review revision error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Could not complete the review. No partial changes were committed.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
