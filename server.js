const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const app = require("./app.js");
const https = require("https");
const fs = require("fs");

// ======================== FOR STARTING NODE ON HTTPS ========================

// const privateKey = fs.readFileSync(
//   "/etc/letsencrypt/live/knowyourcustomer.au/privkey.pem",
//   "utf8"
// );
// const certificate = fs.readFileSync(
//   "/etc/letsencrypt/live/knowyourcustomer.au/cert.pem",
//   "utf8"
// );
// const ca = fs.readFileSync(
//   "/etc/letsencrypt/live/knowyourcustomer.au/chain.pem",
//   "utf8"
// );

// const credentials = { key: privateKey, cert: certificate, ca: ca };

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

// ======================== START THE APPLICATION   ========================

const server = app.listen(port);

// const httpsServer = https.createServer(credentials, app);
// httpsServer.listen(8000);

// catch rejection error
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION. SHUTTING DOWN");
  server.close(() => {
    process.exit(1);
  });
});
