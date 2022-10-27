const empty = "Please enter";

const errorMessages = {
  user: {
    exists: "User already exists with this contact number or email.",
    notExists: "No user exist with this email.",
  },
  name: {
    empty: `${empty} name.`
  },
  email: {
    invalid: "${empty}valid email",
    empty: `${empty} email.`

  },
  contact: {
    invalid: "Contact number length must be between 7 and 15 characters",
    notContact: "Only numbers are allowed",
    empty: `${empty} contact number.`,
  },
  password: {
    invalid: "Password must contain min 8 characters. One uppercase, one lowercase, one number and one special character.",
    oldAndNewSame: "Old and New password cannot be same.",
    newAndConfirmSame: "Password and Confirm password must be same.",
    empty: `${empty} password.`,
    wrongPwd: 'Email or password is incorrect. Please try again.'
  },
  questions: {
    empty: "Question details cannot be empty",
    answerEmpty: `${empty} answer for the question`
  },
  other: {
    serviceProviderInvalidId: `${empty}the serice provider id`,
    customerInvalidId: `${empty}the customer id`,
    customer: "Please add a reveiw for the customer.",
    questions: `${empty} value for all questions.`,
    overallRating: `${empty} overall rating.`,
    totalQuestionsRating: `${empty} total questions rating.`,
    userblock: `${empty} valid user id`
  }
}

module.exports = { errorMessages }
