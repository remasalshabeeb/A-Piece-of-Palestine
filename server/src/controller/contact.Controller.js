
import mongoose from "mongoose";
import Contact from "../models/contact.Model.js";

export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "Please provide your name, email, subject, and message.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (cleanSubject.length < 3 || cleanSubject.length > 150) {
      return res.status(400).json({
        message: "Subject must be between 3 and 150 characters.",
      });
    }

    if (cleanMessage.length < 10 || cleanMessage.length > 3000) {
      return res.status(400).json({
        message: "Message must be between 10 and 3000 characters.",
      });
    }

    const contact = await Contact.create({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      userId: req.user?.id || null,
      status: "pending",
    });

    return res.status(201).json({
      message: "Your message has been submitted for review.",
      contact: {
        id: contact._id,
        name: contact.name,
        subject: contact.subject,
        status: contact.status,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Create contact message error:", error);

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

// Public homepage: only approved messages can be displayed.
export const getApprovedContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find({
      status: "approved",
    })
      .select("name subject message createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get approved contact messages error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Admin: view messages awaiting review.
export const getPendingContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find({
      status: "pending",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get pending contact messages error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Admin: approve or reject a message.
export const reviewContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid contact message ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected.",
      });
    }

    if (
      adminResponse !== undefined &&
      (typeof adminResponse !== "string" ||
        adminResponse.trim().length > 2000)
    ) {
      return res.status(400).json({
        message: "Admin response must be a string of at most 2000 characters.",
      });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    if (contact.status !== "pending") {
      return res.status(409).json({
        message: "This message has already been reviewed.",
      });
    }

    contact.status = status;
    contact.reviewedBy = req.user.id;
    contact.reviewedAt = new Date();
    contact.adminResponse =
      typeof adminResponse === "string" ? adminResponse.trim() : "";

    await contact.save();

    return res.status(200).json({
      message:
        status === "approved"
          ? "Contact message approved."
          : "Contact message rejected.",
      contact,
    });
  } catch (error) {
    console.error("Review contact message error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
