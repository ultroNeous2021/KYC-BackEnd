const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { errorMessages } = require("../utils/messages");

// two ways are present here 

// 1. store details of review along with customer in review, add customer in the collection & 
// 2.store details of customer differently from review. 

// But then when querying, we need to query for two collections, review and customer to get customer details.

const ReviewSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, errorMessages.other.customerInvalidId],
            ref: "Customer"
        },
        serviceProviderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, errorMessages.other.serviceProviderInvalidId],
            ref: "ServiceProvider",
        },
        customerName: {
            type: String,
            required: [true, errorMessages.name.empty],
        },
        customerEmail: {
            type: String,
        },
        customerContact: {
            type: String,
        },
        overallRating: {
            type: Number,
        },
        starsRating: {
            type: Number,
        },
        totalQuestionsRating: {
            type: Number,
        },
        question0: {
            type: Object,
            default: {
                questionId: mongoose.Schema.Types.ObjectId,
                value: 0
            }
        },
        question1: {
            type: Object,
            default: {
                questionId: mongoose.Schema.Types.ObjectId,
                value: 0
            }
        },
        question2: {
            type: Object,
            default: {
                questionId: mongoose.Schema.Types.ObjectId,
                value: 0
            }
        },
        question3: {
            type: Object,
            default: {
                questionId: mongoose.Schema.Types.ObjectId,
                value: 0
            }
        },
        question4: {
            type: Object,
            default: {
                questionId: mongoose.Schema.Types.ObjectId,
                value: 0
            }
        },
        review: {
            type: String,
            default: ""
        },
        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true,
    }
);


const Review = mongoose.model(
    "Review",
    ReviewSchema
);

module.exports = Review;
