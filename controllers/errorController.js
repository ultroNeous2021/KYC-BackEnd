const AppError = require("../utils/appError");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(400, message);
  };

  const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value.  ${value}. Please use another value!`;
    return new AppError(400, message);
  };

  const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(400, message);
  };
  const handleJWTError = () => {
    return new AppError(401, "Invalid token. Please log in again!");
  };
  const handleJWTExpiredError = () => {
    return new AppError("Your token has expired! Please log in again.", 401);
  };

  const sendErrorDev = async (err, req, res) => {
    res.staus(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  };

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  }

  res.status(statusCode).json({
    status,
    message: err.message,
  });
};
