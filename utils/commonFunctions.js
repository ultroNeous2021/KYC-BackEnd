const jwt = require("jsonwebtoken");
const multer = require("multer");
const sharp = require("sharp");

const jwtToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendResponse = (data, statusCode, res, sendToken) => {
  let token = ""
  if (sendToken === true) {
    token = jwtToken(data._id);
  }

  res.status(statusCode).json({
    token,
    data
  });
};


const generateOtp = () => {
  return Math.floor(Math.random() * 9000 + 1000);
};


module.exports = { jwtToken, sendResponse, generateOtp };

