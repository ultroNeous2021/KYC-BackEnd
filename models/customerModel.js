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
        reviews: [{
            type: mongoose.Schema.Types.ObjectId,
            required: [true, errorMessages.other.customer]
        }],
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
        isActive: {
            type: Boolean,
            default: false
        }

        // image: {
        //   type: String,
        //   default: "public/images/customers/default.png",
        // },
        // otp: {
        //   type: Number,
        //   default: null,
        //   select: false,
        // },
        // otpCreatedAt: {
        //   type: Date,
        //   default: null,
        //   select: false
        // },
        // isActive: {
        //   type: Boolean,
        //   default: false,
        // },
    },
    {
        timestamps: true,
    }
);

// CustomerSchema.pre("save", async function (next) {
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
// });

// CustomerSchema.methods.checkPassword = async function (loginPassword) {
//     return await bcrypt.compare(loginPassword, this.password).then((res) => res);
// };

// CustomerSchema.methods.checkPasswordOnReset = async function (
//     loginPassword,
//     oldHashedPassword
// ) {
//     return await bcrypt
//         .compare(loginPassword, oldHashedPassword)
//         .then((res) => res);
// };

const Customer = mongoose.model(
    "Customer",
    CustomerSchema
);

module.exports = Customer;
