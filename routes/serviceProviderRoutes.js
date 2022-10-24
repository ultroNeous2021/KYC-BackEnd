const express = require("express");
const authController = require("../controllers/authController");
const serviceProviderController = require("../controllers/serviceProviderController");
const {
  validateUserSignin,
  validateUserSignup,
  validateNewConfirmPassword,
} = require("../utils/validator");

const router = express.Router();

// auth flow
router.post("/signup", validateUserSignup, authController.signUp);
router.post("/signin", validateUserSignin, authController.signIn);
router.post("/verifyOtp", authController.protect, authController.verifyOtp);
router.post("/forgetPassword", authController.forgetPassword);
router.post(
  "/resetPassword",
  validateNewConfirmPassword,
  authController.protect,
  authController.resetPassword
);
router.get("/resendOtp", authController.protect, authController.resendOtp);
router.post(
  "/changePassword",
  validateNewConfirmPassword,
  authController.protect,
  authController.changePassword
);

// reviews
router.post(
  "/addreview",
  authController.protect,
  serviceProviderController.addReview
);
router.post(
  "/editreview",
  authController.protect,
  serviceProviderController.editReview
);
router.post(
  "/deleteReview",
  authController.protect,
  serviceProviderController.deleteReview
);
router.post(
  "/addToFavourites",
  authController.protect,
  serviceProviderController.addToFavourites
);
router.get(
  "/previousRatings",
  authController.protect,
  serviceProviderController.previousRatings
);
router.get(
  "/myreviews",
  authController.protect,
  serviceProviderController.myReviews
);

// common
router.get(
  "/myprofile",
  authController.protect,
  serviceProviderController.myProfile
);
router.post(
  "/editProfile",
  authController.protect,
  serviceProviderController.uploadUserPhoto,
  serviceProviderController.resizePhoto,
  serviceProviderController.editProfile
);
router.post(
  "/search",
  authController.protect,
  serviceProviderController.search
);
router.get(
  "/homeScreen",
  authController.protect,
  serviceProviderController.homeScreen
);
router.post(
  "/addToFavouriteCustomer",
  authController.protect,
  serviceProviderController.addToFavouriteCustomer
);

module.exports = router;
