const Review = require("../models/reviewModel");
const Customer = require("../models/customerModel");
const catchAsyncError = require("../utils/catchAsyncError");
const { sendResponse, upload } = require("../utils/commonFunctions");
const ServiceProvider = require("../models/serviceProviderModel");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const { errorMessages } = require("../utils/messages");
const Question = require("../models/questionModel");
const { default: mongoose } = require("mongoose");

const sendResponseValue = (res, data) => {
  res.status(200).json({
    data: {
      ...data._doc,
    },
  });
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

  const twoDecimalVals = (num) => {
    return parseFloat(num).toFixed(2) * 1;
  };

  const getStarsRating = (val) => {
    const numVal = val * 1;
    const mainVal = Math.floor(val);
    const pointVal = numVal - mainVal;

    if (pointVal >= 0.5) {
      return Math.ceil(numVal);
    } else {
      return Math.floor(numVal);
    }
  };

  let customerVal;
  if (!customerId) {
    // if new review is made

    const checkIfReviewExists = await Review.findOne({
      $or: [
        {
          $and: [
            {
              customerEmail: customerEmail,
            },

            {
              serviceProviderId: req.user._id,
            },
          ],
        },
        {
          $and: [
            {
              customerContact: customerContact,
            },

            {
              serviceProviderId: req.user._id,
            },
          ],
        },
      ],
    });

    if (checkIfReviewExists && checkIfReviewExists.isActive) {
      return next(new AppError(400, errorMessages.review.reviewExists));
    }

    customerVal = await Customer.create({
      name: customerName,
      email: customerEmail,
      contact: customerContact,
      starsRating: getStarsRating(starsRating),
      question0: {
        questionId: question0.id,
        value: question0.value * 1,
      },
      question1: {
        questionId: question1.id,
        value: question1.value * 1,
      },
      question2: {
        questionId: question2.id,
        value: question2.value * 1,
      },
      question3: {
        questionId: question3.id,
        value: question3.value * 1,
      },
      question4: {
        questionId: question4.id,
        value: question4.value * 1,
      },
      totalReviews: 1,
    });
  } else {
    // if customer already has review

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

    if (checkIfReviewExists && checkIfReviewExists.isActive) {
      return next(new AppError(400, errorMessages.review.reviewExists));
    }

    // 1 for the new review that will be added
    const lengthOfTotalReviews = customer.reviews.length + 1;

    const toUpdateData = {
      starsRating: getStarsRating(
        (customer.starsRating + starsRating) / lengthOfTotalReviews
      ),
      question0: {
        questionId: question0.id,
        value: twoDecimalVals(
          (customer.question0.value + question0.value) / lengthOfTotalReviews
        ),
      },
      question1: {
        questionId: question1.id,
        value: twoDecimalVals(
          (customer.question1.value + question1.value) / lengthOfTotalReviews
        ),
      },
      question2: {
        questionId: question2.id,
        value: twoDecimalVals(
          (customer.question2.value + question2.value) / lengthOfTotalReviews
        ),
      },
      question3: {
        questionId: question3.id,
        value: twoDecimalVals(
          (customer.question3.value + question3.value) / lengthOfTotalReviews
        ),
      },
      question4: {
        questionId: question4.id,
        value: twoDecimalVals(
          (customer.question4.value + question4.value) / lengthOfTotalReviews
        ),
      },
      totalReviews: lengthOfTotalReviews,
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
    starsRating: starsRating,
    question0: {
      questionId: question0.id,
      value: question0.value * 1,
    },
    question1: {
      questionId: question1.id,
      value: question1.value * 1,
    },
    question2: {
      questionId: question2.id,
      value: question2.value * 1,
    },
    question3: {
      questionId: question3.id,
      value: question3.value * 1,
    },
    question4: {
      questionId: question4.id,
      value: question4.value * 1,
    },
    review,
  };

  const reviewNew = await Review.create(newReviewData);

  // add review to the array of customer
  await Customer.findByIdAndUpdate(
    customerVal._id,
    {
      reviews: [...customerVal.reviews, reviewNew._id],
      totalReviews: parseInt(customerVal.totalReviews),
    },
    { new: true }
  );

  // add review to the serviceprovider array
  const totalReviewsForServiceProvider =
    await ServiceProvider.findByIdAndUpdate(req.user._id);

  await ServiceProvider.findByIdAndUpdate(
    req.user._id,
    {
      reviews: [...req.user.reviews, reviewNew._id],
      totalReviews: totalReviewsForServiceProvider.totalReviews + 1,
    },
    { new: true }
  );

  sendResponseValue(res, reviewNew);
});

exports.editReview = catchAsyncError(async (req, res, next) => {
  const {
    reviewId,
    starsRating,
    question0,
    question1,
    question2,
    question3,
    question4,
    review,
  } = req.body;

  const twoDecimalVals = (num) => {
    return parseFloat(num).toFixed(2) * 1;
  };

  const getStarsRating = (val) => {
    const numVal = val * 1;
    const mainVal = Math.floor(val);
    const pointVal = numVal - mainVal;

    if (pointVal >= 0.5) {
      return Math.ceil(numVal);
    } else {
      return Math.floor(numVal);
    }
  };

  const reviewNew = await Review.findByIdAndUpdate(
    reviewId,
    {
      starsRating: parseInt(starsRating),
      question0: {
        questionId: question0.id,
        value: question0.value * 1,
      },
      question1: {
        questionId: question1.id,
        value: question1.value * 1,
      },
      question2: {
        questionId: question2.id,
        value: question2.value * 1,
      },
      question3: {
        questionId: question3.id,
        value: question3.value * 1,
      },
      question4: {
        questionId: question4.id,
        value: question4.value * 1,
      },
      review,
    },
    { new: true }
  );

  // edit the new rating for customer
  let customer = await Customer.findById(reviewNew.customerId).populate(
    "reviews"
  );

  const reviewTotal = customer.reviews.length;

  const newStarRatings = getStarsRating(
    customer.reviews.map((el) => el.starsRating).reduce((a, b) => a + b) /
      reviewTotal
  );
  const newQuesOne = twoDecimalVals(
    customer.reviews.map((el) => el.question0.value).reduce((a, b) => a + b) /
      reviewTotal
  );
  const newQuesTwo = twoDecimalVals(
    customer.reviews.map((el) => el.question1.value).reduce((a, b) => a + b) /
      reviewTotal
  );
  const newQuesThree = twoDecimalVals(
    customer.reviews.map((el) => el.question2.value).reduce((a, b) => a + b) /
      reviewTotal
  );
  const newQuesFour = twoDecimalVals(
    customer.reviews.map((el) => el.question3.value).reduce((a, b) => a + b) /
      reviewTotal
  );
  const newQuesFive = twoDecimalVals(
    customer.reviews.map((el) => el.question4.value).reduce((a, b) => a + b) /
      reviewTotal
  );

  const updatedCustomer = {
    starsRating: newStarRatings,
    question0: {
      questionId: question0.id,
      value: newQuesOne,
    },
    question1: {
      questionId: question1.id,
      value: newQuesTwo,
    },
    question2: {
      questionId: question2.id,
      value: newQuesThree,
    },
    question3: {
      questionId: question3.id,
      value: newQuesFour,
    },
    question4: {
      questionId: question4.id,
      value: newQuesFive,
    },
  };

  await Customer.findByIdAndUpdate(customer._id, updatedCustomer);

  sendResponse(reviewNew, 200, res);
});

exports.myReviews = catchAsyncError(async (req, res, next) => {
  const { _id } = req.user;

  const reviews = await Review.find({ serviceProviderId: _id }).populate(
    "question0.questionId"
  );

  sendResponse(reviews, 200, res);
});

exports.getQuestionsForReview = catchAsyncError(async (req, res, next) => {
  const questions = await Question.find()
    .limit(5)
    .select("-createdAt -updatedAt -isActive -__v");

  sendResponse(questions, 200, res);
});

exports.getCustomerDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  const { page, limit } = req.query;

  const { favouriteCustomers } = req.user;

  const pageOptions = {
    skipVal: (parseInt(page) - 1 || 0) * (parseInt(limit) || 5),
    limitVal: parseInt(limit) || 5,
  };

  const populateString = `question0.questionId question1.questionId question2.questionId question3.questionId question4.questionId`;

  let customer = await Customer.findById(id)
    .populate({
      path: "reviews",
      select: "review starsRating updatedAt ",
      options: {
        skip: pageOptions.skipVal,
        limit: pageOptions.limitVal,
      },
      populate: {
        path: "serviceProviderId",
        select: "name email -_id",
      },
    })
    .populate(populateString, "_id title details")
    .sort("-updatedAt");

  customer = favouriteCustomers.includes(customer._id)
    ? { ...customer._doc, isFavourite: true }
    : { ...customer._doc, isFavourite: false };

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
        ? `${process.env.DEV}/public/images/serviceproviders/${req.file.filename}.jpeg`
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
    .select("name email contact starsRating  totalReviews")
    .limit(5);

  sendResponse(results, 200, res);
});

exports.homeScreen = catchAsyncError(async (req, res, next) => {
  let data = await ServiceProvider.findById(req.user._id)
    .populate({
      path: "reviews favouriteCustomers",
      options: { perDocumentLimit: 5 },
      select:
        "customerName starsRating  review updatedAt totalReviews name customerId",
    })
    .sort("-updatedAt");

  delete data._doc.favouriteReviews;

  sendResponse(data, 200, res);
});

exports.addToFavouriteCustomer = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

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

  sendResponse(favouriteCustomerValues.favouriteCustomers, 200, res);
});

exports.getFavouriteCustomer = catchAsyncError(async (req, res, next) => {
  const { searchText, rating, page, limit } = req.query;

  if (!searchText && !rating && !page && !limit) {
    const favouriteCustomers = await ServiceProvider.findById(req.user._id)
      .populate({
        path: "favouriteCustomers",
        select: "name email contact starsRating totalReviews",
      })
      .select("favouriteCustomers");

    return sendResponse(favouriteCustomers, 200, res);
  }

  let ratingVal = rating * 1 || null;
  let searchVal = searchText || "";

  const pageOptions = {
    skipVal: (parseInt(page) - 1 || 0) * (parseInt(limit) || 5),
    limitVal: parseInt(limit) || 5,
  };

  let favourites;

  if (!ratingVal) {
    favourites = await ServiceProvider.findById(req.user._id)
      .populate({
        path: "favouriteCustomers",
        select: "name email contact starsRating totalReviews",
        options: {
          skip: pageOptions.skipVal,
          limit: pageOptions.limitVal,
        },
        match: {
          $or: [
            {
              name: {
                $regex: searchVal,
                $options: "i",
              },
            },
            {
              email: {
                $regex: searchVal,
                $options: "i",
              },
            },
            {
              contact: {
                $regex: searchVal,
                $options: "i",
              },
            },
          ],
        },
      })
      .select("favouriteCustomers");
  } else {
    favourites = await ServiceProvider.findById(req.user._id)
      .populate({
        path: "favouriteCustomers",
        select: "name email contact starsRating totalReviews",
        options: {
          skip: pageOptions.skipVal,
          limit: pageOptions.limitVal,
        },
        match: {
          $or: [
            {
              name: {
                $regex: searchVal,
                $options: "i",
              },
            },
            {
              email: {
                $regex: searchVal,
                $options: "i",
              },
            },
            {
              contact: {
                $regex: searchVal,
                $options: "i",
              },
            },
          ],
          starsRating: {
            $eq: ratingVal,
          },
        },
      })
      .select("favouriteCustomers");
  }

  sendResponse(favourites, 200, res);
});

exports.previousRatings = catchAsyncError(async (req, res, next) => {
  const { searchText, rating, page, limit } = req.query;

  const favouriteCustomers = req.user.favouriteCustomers;
  const populateString = `question0.questionId question1.questionId question2.questionId question3.questionId question4.questionId`;

  if (!searchText && !rating && !page && !limit) {
    let previousRatings = await ServiceProvider.findById(req.user._id)
      .select("reviews")
      .populate({
        path: "reviews",
        populate: {
          path: populateString,
          select: "title details",
        },
      });

    previousRatings = previousRatings.reviews.map((el) =>
      favouriteCustomers.includes(el.customerId)
        ? { ...el._doc, isFavourite: true }
        : { ...el._doc, isFavourite: false }
    );

    return sendResponse(previousRatings, 200, res);
  }

  let ratingVal = rating * 1 || null;
  let searchVal = searchText || "";

  const pageOptions = {
    skipVal: (parseInt(page) - 1 || 0) * (parseInt(limit) || 5),
    limitVal: parseInt(limit) || 5,
  };

  let previousRatingsVal;
  if (!ratingVal) {
    previousRatingsVal = await ServiceProvider.findById(req.user._id)
      .populate({
        path: "reviews",
        options: {
          skip: pageOptions.skipVal,
          limit: pageOptions.limitVal,
        },
        match: {
          $or: [
            {
              customerName: {
                $regex: searchVal,
                $options: "i",
              },
            },
            {
              customerEmail: {
                $regex: searchVal,
                $options: "i",
              },
            },
            {
              customerContact: {
                $regex: searchVal,
                $options: "i",
              },
            },
          ],
        },
        select:
          "customerName customerId customerEmail customerContact starsRating review question0.value question1.value question2.value question3.value question4.value updatedAt",
        populate: {
          path: populateString,
          select: "title details",
        },
      })
      .select("reviews");
  } else {
    previousRatingsVal = await ServiceProvider.findById(req.user._id)
      .populate({
        path: "reviews",
        options: {
          skip: pageOptions.skipVal,
          limit: pageOptions.limitVal,
        },
        match: {
          $or: [
            {
              customerName: {
                $regex: searchVal,
                $options: "i",
              },
            },
            {
              customerEmail: {
                $regex: searchVal,
                $options: "i",
              },
            },
            {
              customerContact: {
                $regex: searchVal,
                $options: "i",
              },
            },
          ],
          starsRating: {
            $eq: ratingVal,
          },
        },
        select:
          "customerName customerId customerEmail customerContact starsRating review question0.value question1.value question2.value question3.value question4.value updatedAt",
        populate: {
          path: populateString,
          select: "title details",
        },
      })
      .select("reviews");
  }

  previousRatingsVal = previousRatingsVal.reviews.map((el) =>
    favouriteCustomers.includes(el.customerId)
      ? { ...el._doc, isFavourite: true }
      : { ...el._doc, isFavourite: false }
  );

  sendResponse(previousRatingsVal, 200, res);
});

exports.getReviewDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;

  const review = await Review.findById(id).populate("question0.questionId");

  sendResponse(review, 200, res);
});

// exports.addToFavourites = catchAsyncError(async (req, res, next) => {
//   const { id } = req.body;
//   const { favouriteReviews } = req.user;

//   let newFavourites;

//   if (favouriteReviews.includes(id)) {
//     newFavourites = favouriteReviews.filter((el) => el !== id);
//   } else {
//     newFavourites = [...favouriteReviews, id];
//   }

//   let reviews = await ServiceProvider.findByIdAndUpdate(
//     req.user._id,
//     { favouriteReviews: newFavourites },
//     { new: true }
//   ).populate("favouriteReviews", "customerName starsRating");

//   reviews = reviews.favouriteReviews;

//   sendResponse(reviews, 200, res);
// });

// exports.getFavouriteCustomer = catchAsyncError(async (req, res, next) => {
//   const { rating, page, limit, searchText } = req.query;

//   const pageOptions = {
//     skipVal: (parseInt(page) - 1 || 0) * (parseInt(limit) || 5),
//     limitVal: parseInt(limit) || 5,
//   };

//   let customers = await ServiceProvider.findById(req.user._id)
//     .populate("favouriteCustomers", " name totalReviews")
//     .sort("-updatedAt")
//     .select("favouriteCustomers")
//     .skip(pageOptions.skipVal)
//     .limit(pageOptions.limitVal);

//   if (rating) {
//     customers = customers.favouriteCustomers.filter(
//       (el) => Math.floor(el.starsRating) === parseInt(rating)
//     );
//   }

//   sendResponse(customers, 200, res);
// });

// exports.previousRatings = catchAsyncError(async (req, res, next) => {
//   const favourites = req.user.favouriteCustomers;

//   const { page, limit } = req.query;

// const pageOptions = {
//   skipVal: (parseInt(page) - 1 || 0) * (parseInt(limit) || 5),
//   limitVal: parseInt(limit) || 5,
// };

//   let previousRatings = await Review.find({
//     serviceProviderId: req.user._id,
//   })
// .sort("-updatedAt")
// .skip(pageOptions.skipVal)
// .limit(pageOptions.limitVal);

// previousRatings = previousRatings.map((el) =>
//   favourites.includes(el.customerId)
//     ? { ...el._doc, isFavourite: true }
//     : { ...el._doc, isFavourite: false }
// );

//   sendResponse(previousRatings, 200, res);
// });
