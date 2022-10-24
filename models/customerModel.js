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
      default: {
        questionId: mongoose.Schema.Types.ObjectId,
        value: 0,
      },
    },
    question1: {
      type: Object,
      default: {
        questionId: mongoose.Schema.Types.ObjectId,
        value: 0,
      },
    },
    question2: {
      type: Object,
      default: {
        questionId: mongoose.Schema.Types.ObjectId,
        value: 0,
      },
    },
    question3: {
      type: Object,
      default: {
        questionId: mongoose.Schema.Types.ObjectId,
        value: 0,
      },
    },
    question4: {
      type: Object,
      default: {
        questionId: mongoose.Schema.Types.ObjectId,
        value: 0,
      },
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
