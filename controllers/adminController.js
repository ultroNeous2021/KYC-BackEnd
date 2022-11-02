const Review = require("../models/reviewModel");
const Customer = require("../models/customerModel");
const catchAsyncError = require("../utils/catchAsyncError");
const { sendResponse } = require("../utils/commonFunctions");
const ServiceProvider = require("../models/serviceProviderModel");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const { errorMessages } = require("../utils/messages");
const Question = require("../models/questionModel");

exports.getAllCustomers = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  let users;

  if (id) {
    // get reviews by customer
    users = await Customer.findById(id)
      .populate({
        path: "reviews",
        select: "review overallRating isActive",
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
        select: "review overallRating isActive",
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

  sendResponse(question, 200, res);
});

exports.blockUnblockUser = catchAsyncError(async (req, res, next) => {
  const { userId, type } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return next(new AppError(401, errorMessages.other.userblock));
  }

  if (type == "customer") {
    const checkBlocking = await Customer.findOne({ _id: userId });
    const updatedData = await Customer.findByIdAndUpdate(
      { _id: userId },
      { isActive: !checkBlocking.isActive }
    );

    sendResponse(updatedData, 200, res);
  } else {
    const checkBlocking = await ServiceProvider.findOne({ _id: userId });
    const updatedData = await ServiceProvider.findByIdAndUpdate(
      { _id: userId },
      { isActive: !checkBlocking.isActive }
    );
    sendResponse(updatedData, 200, res);
  }
});

exports.search = catchAsyncError(async (req, res, next) => {
  const { searchText, searchField } = req.body;
  let currentUser = req.user._id;
  let Model = Customer;
  if (searchField && searchField === "ServiceProvider") {
    Model = ServiceProvider;
  }
  const results = await Model.find({
    $and: [
      {
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
      },
      { _id: { $ne: currentUser } },
    ],
  })
    .select("name email contact isActive")
    .limit(5);

  sendResponse(results, 200, res);
});

exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  const review = await Review.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).populate({
    path: "customerId",
    select: "reviews",
    populate: {
      path: "reviews",
      select:
        "question0 question1 question2 question3 question4 overallRating starsRating totalQuestionsRating",
    },
  });

  let updatedReviewList = review.customerId.reviews.filter(
    (el) => `${el._id}` !== id
  );

  let updatedReviewArr = updatedReviewList.map((el) => el._id);

  let updatedReviewListLength = updatedReviewList.length;

  let valuesToBeUpdated = {
    totalQuestionsRating: 0,
    overallRating: 0,
    starsRating: 0,
    totalReviews: 0,
    reviews: [],
  };

  if (updatedReviewListLength > 0) {
    // TotalQuesRat = (q1 + q2 + q4 + q5) + (q1 + q2 + q3 + q4 + q5) + ..... / Total No. of reviews
    valuesToBeUpdated.totalQuestionsRating =
      (
        updatedReviewList
          .map(
            (el) =>
              el.question0.value +
              el.question1.value +
              el.question2.value +
              el.question3.value +
              el.question4.value
          )
          .reduce((a, b) => a + b) / updatedReviewListLength
      ).toFixed(1) * 1;

    valuesToBeUpdated.starsRating =
      (
        updatedReviewList.map((el) => el.starsRating).reduce((a, b) => a + b) /
        updatedReviewListLength
      ).toFixed(1) * 1;

    valuesToBeUpdated.overallRating =
      (
        (valuesToBeUpdated.totalQuestionsRating +
          valuesToBeUpdated.starsRating) /
        2
      ).toFixed(1) * 1;

    valuesToBeUpdated.reviews = updatedReviewArr;
    valuesToBeUpdated.totalReviews = updatedReviewListLength;
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    review.customerId,
    valuesToBeUpdated
  );

  const serviceProviderVal = await ServiceProvider.findById(
    review.serviceProviderId
  );

  let updatedServiceProvider = serviceProviderVal.reviews.filter(
    (el) => `${el}` !== id
  );

  let updatedServiceProviderLength = updatedServiceProvider.length;

  updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
    serviceProviderVal,
    {
      reviews: updatedServiceProvider,
      totalReviews: updatedServiceProviderLength,
    },
    { new: true }
  );

  sendResponse(valuesToBeUpdated, 200, res);
});
