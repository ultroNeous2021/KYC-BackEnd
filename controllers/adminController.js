const Review = require("../models/reviewModel");
const Customer = require("../models/customerModel");
const catchAsyncError = require("../utils/catchAsyncError");
const { sendResponse } = require("../utils/commonFunctions");
const ServiceProvider = require("../models/serviceProviderModel");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const { errorMessages } = require("../utils/messages");

exports.getAllCustomers = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  let users;

  if (id) {
    // get reviews by customer
    users = await Customer.findById(id)
      .populate({
        path: "reviews",
        select: "review overallRating",
        populate: {
          path: "serviceProviderId",
          select: "name",
        },
      })
      .select("name email contact overallRating totalReviews");
  } else {
    users = await Customer.find().sort("-updatedAt");
  }

  sendResponse(users, 200, res);
});

exports.getAllServiceProviders = catchAsyncError(async (req, res, next) => {
  let currentUser = req.user._id;

  const { id } = req.body;

  let users;

  if (id) {
    // get reviews by serviceprovider
    users = await ServiceProvider.findById(id)
      .populate({
        path: "reviews",
        select: "review overallRating",
        populate: {
          path: "customerId",
          select: "name",
        },
      })
      .select("name email contact overallRating totalReviews");
  } else {
    users = await ServiceProvider.find({
      _id: { $ne: currentUser },
    }).sort("-updatedAt");
  }

  sendResponse(users, 200, res);
});

exports.addQuestion = catchAsyncError(async (req, res, next) => {
  const { title, details } = req.body;

  const question = await Question.create({
    title,
    details,
  });

  sendResponse(serviceProviders, 200, res);
});

exports.blockUnblockUser = catchAsyncError(async (req, res, next) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return next(new AppError(401, errorMessages.other.userblock));
  }

  const checkBlocking = await ServiceProvider.findOne({ _id: userId });
  const updatedData = await ServiceProvider.findByIdAndUpdate(
    { _id: userId },
    { isActive: !checkBlocking.isActive }
  );

  sendResponse(updatedData, 200, res);
});

exports.search = catchAsyncError(async (req, res, next) => {
  const { searchText, searchField } = req.body;

  let Model = Customer;
  if (searchField && searchField === "ServiceProvider") {
    Model = ServiceProvider;
  }

  const results = await Model.find({
    $or: [
      {
        name: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        email: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        contact: {
          $regex: searchText,
          $options: "i",
        },
      },
    ],
  })
    .select("name email contact")
    .limit(5);

  sendResponse(results, 200, res);
});
