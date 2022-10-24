const mongoose = require("mongoose");
const { errorMessages } = require("../utils/messages");

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, errorMessages.name.empty],
    },
    details: {
      type: String,
      required: [true, errorMessages.questions.empty],
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

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
