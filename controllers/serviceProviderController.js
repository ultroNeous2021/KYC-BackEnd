const Review = require("../models/reviewModel")
const Customer = require("../models/customerModel")
const catchAsyncError = require("../utils/catchAsyncError")
const { sendResponse } = require("../utils/commonFunctions")
const ServiceProvider = require("../models/serviceProviderModel")


const sendResponseValue = (res, data) => {
    res.status(200).json({
        data: {
            ...data._doc
        }
    })
}

exports.addReview = catchAsyncError(async (req, res, next) => {

    const { customerName, customerEmail, customerContact, starsRating, question0, question1, question2, question3, question4, review } = req.body

    const totalQuestionsRatingValue = question0.value + question1.value + question2.value + question3.value + question4.value


    let customer = await Customer.find({
        $or: [
            { email: customerEmail },
            { contact: customerContact }
        ]
    })

    customer = customer[0]

    if (!customer) {
        customer = await Customer.create({
            name: customerName,
            email: customerEmail,
            contact: customerContact,
            starsRating: parseInt(starsRating),
            overallRating: parseInt(totalQuestionsRatingValue + starsRating),
            totalQuestionsRating: parseInt(totalQuestionsRatingValue),
            question0: {
                questionId: question0.id,
                value: question0.value
            },
            question1: {
                questionId: question1.id,
                value: question1.value
            }, question2: {
                questionId: question2.id,
                value: question2.value
            }, question3: {
                questionId: question3.id,
                value: question3.value
            }, question4: {
                questionId: question4.id,
                value: question4.value
            },

        })
    } else {
        customer = await Customer.findByIdAndUpdate(customer._id,
            {
                starsRating: parseInt(customer.starsRating + starsRating),
                overallRating: parseInt(customer.overallRating + totalQuestionsRatingValue + starsRating),
                totalQuestionsRating: parseInt(customer.totalQuestionsRating + totalQuestionsRatingValue),
                question0: {
                    questionId: question0.id,
                    value: customer.question0.value + question0.value
                },
                question1: {
                    questionId: question1.id,
                    value: customer.question1.value + question1.value
                }, question2: {
                    questionId: question2.id,
                    value: customer.question2.value + question2.value
                }, question3: {
                    questionId: question3.id,
                    value: customer.question3.value + question3.value
                }, question4: {
                    questionId: question4.id,
                    value: customer.question4.value + question4.value
                },

            }, { new: true })
    }


    const reviewNew = await Review.create({
        customerId: customer._doc._id,
        serviceProviderId: req.user._id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerContact: customer.contact,
        starsRating: parseInt(starsRating),
        overallRating: parseInt(totalQuestionsRatingValue + starsRating),
        totalQuestionsRating: parseInt(totalQuestionsRatingValue),
        question0: {
            questionId: question0.id,
            value: question0.value
        },
        question1: {
            questionId: question1.id,
            value: question1.value
        }, question2: {
            questionId: question2.id,
            value: question2.value
        }, question3: {
            questionId: question3.id,
            value: question3.value
        }, question4: {
            questionId: question4.id,
            value: question4.value
        },
        review
    })

    await Customer.findByIdAndUpdate(customer._id, {
        reviews: [...customer.reviews, reviewNew._id]
    }, { new: true })

    await ServiceProvider.findByIdAndUpdate(req.user._id, { reviews: [...req.user.reviews, reviewNew._id] }, { new: true })

    sendResponseValue(res, reviewNew)
})

exports.editReview = catchAsyncError(async (req, res, next) => {

    const { reviewId, customerName, customerEmail, customerContact, starsRating, question0, question1, question2, question3, question4, review } = req.body

    const totalQuestionsRatingValue = question0.value + question1.value + question2.value + question3.value + question4.value

    console.log(reviewId);

    const reviewNew = await Review.findByIdAndUpdate(reviewId, {
        customerName: customerName,
        customerEmail: customerEmail,
        customerContact: customerContact,
        starsRating: parseInt(starsRating),
        overallRating: parseInt(totalQuestionsRatingValue + starsRating),
        totalQuestionsRating: parseInt(totalQuestionsRatingValue),
        question0: {
            questionId: question0.id,
            value: question0.value
        },
        question1: {
            questionId: question1.id,
            value: question1.value
        }, question2: {
            questionId: question2.id,
            value: question2.value
        }, question3: {
            questionId: question3.id,
            value: question3.value
        }, question4: {
            questionId: question4.id,
            value: question4.value
        },
        review
    }, { new: true })


    sendResponseValue(res, reviewNew)


})

exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const { id } = req.body

    const reviewNew = await Review.findByIdAndUpdate(id, { isActive: false }, { new: true })

    sendResponseValue(res, reviewNew)

})

exports.myReviews = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user

    const reviews = await Review.find({ serviceProviderId: _id })

    res.status(200).json({
        data: reviews

    })

})

exports.addToFavourites = catchAsyncError(async (req, res, next) => {
    const { id } = req.body
    const { favourites } = req.user

    let newFavourites;

    if (favourites.includes(id)) {
        newFavourites = favourites.filter(el => el !== id)
    } else {
        newFavourites = [...favourites, id]
    }


    let reviews = await ServiceProvider.findByIdAndUpdate(req.user._id, { favourites: newFavourites }, { new: true }).populate('favourites')

    sendResponse(reviews, 200, res)

})

exports.previousReviews = catchAsyncError(async (req, res, next) => {
    const reviews = await Review.find({ serviceProviderId: req.user._id }).sort('-updatedAt')

    sendResponse(reviews, 200, res)
})