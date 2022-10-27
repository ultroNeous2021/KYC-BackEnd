const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { errorMessages } = require("../utils/messages");

const ServiceProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, errorMessages.name.empty],
    },
    email: {
      type: String,
      required: [true, errorMessages.email.empty],
      unique: true,
    },
    contact: {
      type: String,
      required: [true, errorMessages.contact.empty],
      unique: true,
    },
    password: {
      type: String,
      required: [true, errorMessages.password.empty],
      select: false,
    },
    image: {
      type: String,
      default: "public/images/serviceproviders/default.png",
    },
    role: {
      type: String,
      default: "serviceProvider",
      enum: ["admin", "serviceProvider"],
    },
    favouriteReviews: {
      type: Array,
      default: [],
      ref: "Review",
    },
    reviews: {
      type: Array,
      default: [],
      ref: "Review",
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    favouriteCustomers: {
      type: Array,
      default: [],
      ref: "Customer",
    },
    otp: {
      type: Number,
      default: null,
      select: false,
    },
    otpCreatedAt: {
      type: Date,
      default: null,
      select: false,
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

ServiceProviderSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

ServiceProviderSchema.methods.checkPassword = async function (loginPassword) {
  return await bcrypt.compare(loginPassword, this.password).then((res) => res);
};

ServiceProviderSchema.methods.checkPasswordOnReset = async function (
  loginPassword,
  oldHashedPassword
) {
  return await bcrypt
    .compare(loginPassword, oldHashedPassword)
    .then((res) => res);
};

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  ServiceProviderSchema
);

module.exports = ServiceProvider;
