const Review = require("../models/reviewModel")
const Customer = require("../models/customerModel")
const catchAsyncError = require("../utils/catchAsyncError")
const { sendResponse } = require("../utils/commonFunctions")
const ServiceProvider = require("../models/serviceProviderModel")
const mongoose = require("mongoose")
const AppError = require("../utils/appError")
const { errorMessages } = require("../utils/messages")


exports.getAllCustomers = catchAsyncError(async (req, res, next) => {
  const customers = await Customer.find().sort("-updatedAt");

  sendResponse(customers, 200, res);
});

exports.getAllServiceProviders = catchAsyncError(async (req, res, next) => {
  const serviceProviders = await ServiceProvider.find().sort("-updatedAt");

  sendResponse(serviceProviders, 200, res);
});

exports.addQuestion = catchAsyncError(async (req, res, next) => {
  const { title, details } = req.body;

  const question = await Question.create({
    title,
    details,
  });

  sendResponse(serviceProviders, 200, res)
})

exports.blockUnblockUser = catchAsyncError(async (req, res, next) => {
  const { userId } = req.body

  if (!mongoose.isValidObjectId(userId)) {
    return next(
      new AppError(401, errorMessages.other.userblock)
    );
  }

  const checkBlocking = await ServiceProvider.findOne({ _id: userId })
  const updatedData = await ServiceProvider.findByIdAndUpdate({ _id: userId }, { isActive: !checkBlocking.isActive })

  sendResponse(updatedData, 200, res)
})
