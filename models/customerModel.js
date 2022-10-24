const mongoose = require("mongoose");
const { errorMessages } = require("../utils/messages");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, errorMessages.name.empty],
    },
    email: {
      type: String,
      unique: true,
    },
    contact: {
      type: String,
      unique: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, errorMessages.other.customer],
        ref: "Review",
      },
    ],
    totalReviews: {
      type: Number,
      default: 0,
    },
    overallRating: {
      type: Number,
      required: [true, errorMessages.other.overallRating],
    },
    starsRating: {
      type: Number,
      required: [true, errorMessages.other.overallRating],
    },
    totalQuestionsRating: {
      type: Number,
      required: [true, errorMessages.other.totalQuestionsRating],
    },
    question0: {
      type: Object,
      questionId: mongoose.Schema.Types.ObjectId,
      value: 0,
      ref: "Question",
    },
    question1: {
      type: Object,
      questionId: mongoose.Schema.Types.ObjectId,
      value: 0,
      ref: "Question",
    },
    question2: {
      type: Object,
      questionId: mongoose.Schema.Types.ObjectId,
      value: 0,
      ref: "Question",
    },
    question3: {
      type: Object,
      questionId: mongoose.Schema.Types.ObjectId,
      value: 0,
      ref: "Question",
    },
    question4: {
      type: Object,
      questionId: mongoose.Schema.Types.ObjectId,
      value: 0,
      ref: "Question",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
