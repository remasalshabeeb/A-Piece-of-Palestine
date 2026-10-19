
import mongoose from "mongoose";
import Rating from "../models/rating.Model.js";

export const createRating = async (req, res) => {
  try {
    const { rating, comment = "" } = req.body;

    if (!req.user?.id || !mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({
        message: "Please log in before submitting a rating.",
      });
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5.",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Comment must be a string of at most 1000 characters.",
      });
    }

    const savedRating = await Rating.create({
      userId: req.user.id,
      rating,
      comment: comment.trim(),
      status: "pending",
    });

    return res.status(201).json({
      message: "Your rating has been submitted for review.",
      rating: {
        _id: savedRating._id,
        rating: savedRating.rating,
        comment: savedRating.comment,
        status: savedRating.status,
        createdAt: savedRating.createdAt,
      },
    });
  } catch (error) {
    console.error("Create rating error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Public: only approved ratings can be displayed.
export const getApprovedRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ status: "approved" })
      .populate("userId", "name")
      .select("userId rating comment createdAt")
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Get approved ratings error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Admin: view ratings awaiting review.
export const getPendingRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ status: "pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Get pending ratings error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Admin: approve or reject a rating.
export const reviewRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse = "" } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid rating ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected.",
      });
    }

    if (
      typeof adminResponse !== "string" ||
      adminResponse.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Admin response must be a string of at most 1000 characters.",
      });
    }

    const rating = await Rating.findById(id);

    if (!rating) {
      return res.status(404).json({
        message: "Rating not found.",
      });
    }

    if (rating.status !== "pending") {
      return res.status(409).json({
        message: "This rating has already been reviewed.",
      });
    }

    rating.status = status;
    rating.reviewedBy = req.user.id;
    rating.reviewedAt = new Date();
    rating.adminResponse = adminResponse.trim();

    await rating.save();

    return res.status(200).json({
      message:
        status === "approved"
          ? "Rating approved successfully."
          : "Rating rejected successfully.",
      rating,
    });
  } catch (error) {
    console.error("Review rating error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
