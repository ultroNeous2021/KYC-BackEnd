const jwt = require("jsonwebtoken");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./appError");

const jwtToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendResponse = (data, statusCode, res, sendToken) => {
  let token = "";
  if (sendToken === true) {
    token = jwtToken(data._id);
  }

  res.status(statusCode).json({
    token,
    data,
  });
};

const generateOtp = () => {
  return Math.floor(Math.random() * 9000 + 1000);
};

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  const whitelist = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

  if (whitelist.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(401, "Only jpeg, png, jpg and webp files are allowed"));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = { jwtToken, sendResponse, generateOtp, upload };
