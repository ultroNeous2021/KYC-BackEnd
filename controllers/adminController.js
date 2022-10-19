const Review = require("../models/reviewModel")
const Customer = require("../models/customerModel")
const catchAsyncError = require("../utils/catchAsyncError")
const { sendResponse } = require("../utils/commonFunctions")
const ServiceProvider = require("../models/serviceProviderModel")



exports.getAllCustomers = catchAsyncError(async (req, res, next) => {
    const customers = await Customer.find().sort('-updatedAt')

    sendResponse(customers, 200, res)
})

exports.getAllServiceProviders = catchAsyncError(async (req, res, next) => {
    const serviceProviders = await ServiceProvider.find().sort('-updatedAt')

    sendResponse(serviceProviders, 200, res)
})