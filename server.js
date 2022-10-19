const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const app = require("./app.js");

// ======================== EVERYTHING RELATED TO SERVER WILL BE HERE ========================

// catch exception error
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION. SHUTTING DOWN");
  process.exit(1);
});

// pass data in app using .env
dotenv.config({ path: "./.env" });

// db data
const db = process.env.DATABASE.replace(
  "<password>",
  process.env.MONGODB_PASSWORD
);

// mongoose connection string
mongoose
  .connect(db)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 8000;

const server = app.listen(port);

// catch rejection error
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION. SHUTTING DOWN");
  server.close(() => {
    process.exit(1);
  });
});
