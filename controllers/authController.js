const jwt = require("jsonwebtoken");
var createError = require("http-errors");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
const { sendResponse, generateOtp } = require("../utils/commonFunctions.js");
const ServiceProvider = require("../models/serviceProviderModel");
const { errorMessages } = require("../utils/messages");

// extract user info from the token and pass user details to the next middleware
exports.protect = catchAsyncError(async (req, res, next) => {
  let token; // get token sent by the user
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") // check if the token exists
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    createError(404, `You're not logged in. Please login to access.`); // token is invalid or token is not present
  }

  const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY); // decode and get id

  const userDetails = await ServiceProvider.findById(id).select(
    "+otp +otpCreatedAt"
  ); // change model name to the data required from

  req.user = userDetails; // save user details in variable
  next(); // pass in to the next controller
});

exports.signUp = catchAsyncError(async (req, res, next) => {
  let user;
  const { email, name, password, contact } = req.body;

  user = await ServiceProvider.findOne({ email });

  if (!user) {
    user = await ServiceProvider.findOne({ contact });
  }

  if (user) {
    return next(new AppError(409, errorMessages.user.exists));
  }

  const otp = generateOtp();
  const otpCreatedAt = Date.now();

  const userDetails = await ServiceProvider.create({
    email,
    name,
    contact,
    password,
    otp,
    otpCreatedAt,
  });

  delete userDetails._doc.password;
  delete userDetails._doc.otp;
  delete userDetails._doc.otpCreatedAt;

  sendResponse(userDetails, 200, res, true);
});

exports.signIn = catchAsyncError(async (req, res, next) => {
  let user;
  const { email, password } = req.body;

  user = await ServiceProvider.findOne({ email }).select("+password");



  if (!user) {
    return next(new AppError(409, errorMessages.password.wrongPwd));
  }

  if (user.isActive) {
    return next(new AppError(409, errorMessages.user.blocked));
  }

  if (!(await user.checkPassword(password))) {
    return next(new AppError(409, errorMessages.password.wrongPwd));
  }

  delete user._doc.password;
  delete user._doc.otp;
  delete user._doc.otpCreatedAt;

  sendResponse(user, 200, res, true);
});

exports.verifyOtp = catchAsyncError(async (req, res, next) => {
  const { otp, otpCreatedAt } = req.user;

  if (
    Date.now() >
    new Date(`${otpCreatedAt}`).getTime() +
    1000 * 60 * process.env.OTP_EXPIRES_IN
  ) {
    req.user.otp = "";
    await req.user.save();
    return next(
      new AppError(
        401,
        "Otp has expired. Please resend the otp and verify again."
      )
    );
  }

  if (parseInt(req.body.otp) !== otp) {
    return next(new AppError(401, "Invalid OTP. Please try again"));
  }

  let updatedUser;

  updatedUser = await ServiceProvider.findByIdAndUpdate(
    req.user._id,
    { otp: null },
    { new: true }
  );

  sendResponse(updatedUser, 200, res);
});

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  let user;
  let otp = generateOtp();
  const smsText = `Forgot your password? Here is your reset code: ${otp}. The code will be valid only for ${process.env.OTP_EXPIRES_IN} minutes`;

  user = await ServiceProvider.findOneAndUpdate(
    { email: req.body.email },
    { otp: otp, otpCreatedAt: Date.now() },
    { new: true }
  );

  if (!user) {
    return next(new AppError(404, "No user found for this account."));
  }

  // send email for password

  delete user._doc.otp;
  delete user._doc.otpCreatedAt;

  sendResponse(user, 200, res, true);
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { newPassword } = req.body;

  const user = await ServiceProvider.findById(req.user._id).select("+password");

  if (await user.checkPasswordOnReset(newPassword, user.password)) {
    return next(new AppError(401, errorMessages.password.oldAndNewSame));
  }

  user.password = newPassword;
  await user.save();

  sendResponse(user, 200, res, true);
});

exports.resendOtp = catchAsyncError(async (req, res, next) => {
  let user;
  const { _id } = req.user;
  let otp = generateOtp();
  const smsText = `Your otp for forget password is: ${otp}`;

  user = await ServiceProvider.findByIdAndUpdate(
    _id,
    { otp: otp, otpCreatedAt: Date.now() },
    { new: true }
  );

  sendResponse(user, 200, res, true);
});

exports.changePassword = catchAsyncError(async (req, res, next) => {
  const user = await ServiceProvider.findById(req.user._id).select("+password");
  const { newPassword } = req.body;

  if (await user.checkPasswordOnReset(newPassword, user.password)) {
    return next(new AppError(401, errorMessages.password.oldAndNewSame));
  }

  // send email for password change

  user.password = newPassword;
  await user.save();

  sendResponse(user, 200, res);
});
