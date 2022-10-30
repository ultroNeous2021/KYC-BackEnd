const Review = require("../models/reviewModel");
const Customer = require("../models/customerModel");
const catchAsyncError = require("../utils/catchAsyncError");
const { sendResponse, upload } = require("../utils/commonFunctions");
const ServiceProvider = require("../models/serviceProviderModel");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const { errorMessages } = require("../utils/messages");
const Question = require("../models/questionModel");

const sendResponseValue = (res, data) => {
  res.status(200).json({
    data: {
      ...data._doc,
    },
  });
};

const twoDecimalVals = (num) => {
  return parseFloat(num).toFixed(2);
};

exports.addReview = catchAsyncError(async (req, res, next) => {
  const {
    customerName,
    customerEmail,
    customerContact,
    starsRating,
    question0,
    question1,
    question2,
    question3,
    question4,
    review,
    customerId,
  } = req.body;

  const totalQuestionsRatingValue =
    question0.value +
    question1.value +
    question2.value +
    question3.value +
    question4.value;

  let customerVal;
  if (!customerId) {
    customerVal = await Customer.create({
      name: customerName,
      email: customerEmail,
      contact: customerContact,
      starsRating: parseInt(starsRating),
      totalQuestionsRating: parseInt(totalQuestionsRatingValue),
      overallRating: twoDecimalVals(
        (totalQuestionsRatingValue + starsRating) / 2
      ),
      question0: {
        questionId: question0.id,
        value: question0.value,
      },
      question1: {
        questionId: question1.id,
        value: question1.value,
      },
      question2: {
        questionId: question2.id,
        value: question2.value,
      },
      question3: {
        questionId: question3.id,
        value: question3.value,
      },
      question4: {
        questionId: question4.id,
        value: question4.value,
      },
    });
  } else {
    let customer = await Customer.findById(customerId);

    const checkIfReviewExists = await Review.findOne({
      $and: [
        {
          customerId: customerId,
        },
        {
          serviceProviderId: req.user._id,
        },
      ],
    });

    if (checkIfReviewExists) {
      return next(new AppError(400, errorMessages.review.reviewExists));
    }

    // 1 for the new review that will be added
    const lengthOfTotalReviews = customer.reviews.length + 1;

    const toUpdateData = {
      starsRating: twoDecimalVals(
        (customer.starsRating + starsRating) / lengthOfTotalReviews
      ),
      totalQuestionsRating: twoDecimalVals(
        (customer.totalQuestionsRating + totalQuestionsRatingValue) /
          lengthOfTotalReviews
      ),
      overallRating: twoDecimalVals(
        (customer.overallRating +
          (totalQuestionsRatingValue + starsRating) / 2) /
          lengthOfTotalReviews
      ),
      question0: {
        questionId: question0.id,
        value:
          (customer.question0.value + question0.value) / lengthOfTotalReviews,
      },
      question1: {
        questionId: question1.id,
        value:
          (customer.question1.value + question1.value) / lengthOfTotalReviews,
      },
      question2: {
        questionId: question2.id,
        value:
          (customer.question2.value + question2.value) / lengthOfTotalReviews,
      },
      question3: {
        questionId: question3.id,
        value:
          (customer.question3.value + question3.value) / lengthOfTotalReviews,
      },
      question4: {
        questionId: question4.id,
        value:
          (customer.question4.value + question4.value) / lengthOfTotalReviews,
      },
    };

    // add new rating for the customer
    customerVal = await Customer.findByIdAndUpdate(customer._id, toUpdateData, {
      new: true,
    });
  }

  // create a new review
  const newReviewData = {
    customerId: customerVal._doc._id,
    serviceProviderId: req.user._id,
    customerName: customerVal.name,
    customerEmail: customerVal.email,
    customerContact: customerVal.contact,
    starsRating: twoDecimalVals(starsRating),
    overallRating: twoDecimalVals(
      (totalQuestionsRatingValue + starsRating) / 2
    ),
    totalQuestionsRating: twoDecimalVals(totalQuestionsRatingValue),
    question0: {
      questionId: question0.id,
      value: question0.value,
    },
    question1: {
      questionId: question1.id,
      value: question1.value,
    },
    question2: {
      questionId: question2.id,
      value: question2.value,
    },
    question3: {
      questionId: question3.id,
      value: question3.value,
    },
    question4: {
      questionId: question4.id,
      value: question4.value,
    },
    review,
  };

  const reviewNew = await Review.create(newReviewData);

  // add review to the array of customer
  await Customer.findByIdAndUpdate(
    customerVal._id,
    {
      reviews: [...customerVal.reviews, reviewNew._id],
      totalReviews: parseInt(customerVal.totalReviews) + 1,
    },
    { new: true }
  );

  // add review to the serviceprovider array
  await ServiceProvider.findByIdAndUpdate(
    req.user._id,
    {
      reviews: [...req.user.reviews, reviewNew._id],
      totalReviews: parseInt(customerVal.totalReviews) + 1,
    },
    { new: true }
  );

  sendResponseValue(res, reviewNew);
});

exports.editReview = catchAsyncError(async (req, res, next) => {
  const {
    reviewId,
    customerName,
    customerEmail,
    customerContact,
    starsRating,
    question0,
    question1,
    question2,
    question3,
    question4,
    review,
  } = req.body;

  const totalQuestionsRatingValue =
    question0.value +
    question1.value +
    question2.value +
    question3.value +
    question4.value;

  const reviewNew = await Review.findByIdAndUpdate(
    reviewId,
    {
      customerName: customerName,
      customerEmail: customerEmail,
      customerContact: customerContact,
      starsRating: parseInt(starsRating),
      overallRating: parseInt(totalQuestionsRatingValue + starsRating),
      totalQuestionsRating: parseInt(totalQuestionsRatingValue),
      question0: {
        questionId: question0.id,
        value: question0.value,
      },
      question1: {
        questionId: question1.id,
        value: question1.value,
      },
      question2: {
        questionId: question2.id,
        value: question2.value,
      },
      question3: {
        questionId: question3.id,
        value: question3.value,
      },
      question4: {
        questionId: question4.id,
        value: question4.value,
      },
      review,
    },
    { new: true }
  );

  sendResponseValue(res, reviewNew);
});

exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;
  // const reviewNew = await Review.findByIdAndUpdate(
  //   id,
  //   { isActive: false },
  //   { new: true }
  // );
  const reviewNew = await Review.findOneAndUpdate(
    { _id: id },
    { isActive: false, new: true }
  ).clone();

  sendResponseValue(res, reviewNew);
});

exports.myReviews = catchAsyncError(async (req, res, next) => {
  const { _id } = req.user;

  const reviews = await Review.find({ serviceProviderId: _id });

  sendResponse(reviews, 200, res);
});

exports.addToFavourites = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;
  const { favouriteReviews } = req.user;

  let newFavourites;

  if (favouriteReviews.includes(id)) {
    newFavourites = favouriteReviews.filter((el) => el !== id);
  } else {
    newFavourites = [...favouriteReviews, id];
  }

  let reviews = await ServiceProvider.findByIdAndUpdate(
    req.user._id,
    { favouriteReviews: newFavourites },
    { new: true }
  ).populate("favouriteReviews", "customerName starsRating");

  reviews = reviews.favouriteReviews;

  sendResponse(reviews, 200, res);
});

exports.previousRatings = catchAsyncError(async (req, res, next) => {
  const favourites = req.user.favouriteReviews;

  const { page, limit } = req.body;

  const pageOptions = {
    skipVal: (parseInt(page) - 1 || 0) * (parseInt(limit) || 10),
    limitVal: parseInt(limit) || 10,
  };

  let previousRatings = await Review.find({
    serviceProviderId: req.user._id,
  })
    .sort("-updatedAt")
    .skip(pageOptions.skipVal)
    .limit(pageOptions.limitVal);

  previousRatings = previousRatings.map((el) =>
    favourites.includes(el._id)
      ? { ...el._doc, isFavourite: true }
      : { ...el._doc, isFavourite: false }
  );

  sendResponse(previousRatings, 200, res);
});

exports.getQuestionsForReview = catchAsyncError(async (req, res, next) => {
  const questions = await Question.find()
    .limit(5)
    .select("-createdAt -updatedAt -isActive -__v");

  sendResponse(questions, 200, res);
});

exports.getCustomerDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  const populateString = `question0.questionId question1.questionId question2.questionId question3.questionId question4.questionId`;

  const customer = await Customer.findById(id)
    .populate("reviews", "serviceProviderName review updatedAt overallRating")
    .populate(populateString, "_id title details");

  sendResponse(customer, 200, res);
});

exports.myProfile = catchAsyncError(async (req, res, next) => {
  let results = await ServiceProvider.findById(req.user._id).select(
    "-favouriteReviews -previousRatings -favouriteCustomers -reviews"
  );
  sendResponse(results, 200, res);
});

exports.uploadUserPhoto = upload.single("image");

exports.resizePhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `serviceprovider-${req.user.id}`;

  sharp(req.file.buffer)
    .jpeg({ quality: 100 })
    .toFile(`public/images/serviceproviders/${req.file.filename}.jpeg`);

  next();
};

exports.editProfile = catchAsyncError(async (req, res, next) => {
  let user = await ServiceProvider.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      image: req.file
        ? `public/images/serviceproviders/${req.file.filename}.jpeg`
        : req.user.image,
    },
    { new: true }
  ).select("-favouriteReviews -previousRatings -favouriteCustomers");

  user = { ...user._doc, reviews: user.reviews.length };
  sendResponse(user, 200, res);
});

exports.search = catchAsyncError(async (req, res, next) => {
  const { searchText } = req.body;

  const results = await Customer.find({
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
    .select("name")
    .limit(5);

  sendResponse(results, 200, res);
});

exports.homeScreen = catchAsyncError(async (req, res, next) => {
  let data = await ServiceProvider.findById(req.user._id)
    .populate({
      path: "favouriteReviews reviews",
      options: { perDocumentLimit: 10 },
      select: "customerName overallRating review updatedAt totalReviews",
    })
    .sort("-updatedAt");

  sendResponse(data, 200, res);
});

exports.addToFavouriteCustomer = catchAsyncError(async (req, res, next) => {
  const { id, rating } = req.body;

  const { favouriteCustomers } = req.user;

  let newFavourites;

  if (favouriteCustomers.includes(id)) {
    newFavourites = favouriteCustomers.filter((el) => el !== id);
  } else {
    newFavourites = [...favouriteCustomers, id];
  }

  let favouriteCustomerValues = await ServiceProvider.findByIdAndUpdate(
    req.user._id,
    { favouriteCustomers: newFavourites },
    { new: true }
  );

  let favouriteCustomersReviews = await Review.find({
    customerId: {
      $in: favouriteCustomerValues.favouriteCustomers,
    },
  }).select("customerName overallRating review");

  sendResponse(favouriteCustomersReviews, 200, res);
});
