const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser")

const serviceProviderRoutes = require("./routes/serviceProviderRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const ErrorController = require("./controllers/errorController.js");

// ======================== EVERYTHING RELATED TO APP WILL BE HERE ========================

const app = express();

app.use(cors()); // solves cors error
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json({ limit: "10kb" })); // parses json data from frontend
app.use("/public/images", express.static(path.join("public", "images"))); // serves static images

// test
app.get("/test", (req, res, next) => {
  res.send("Working...");
});

// routes
app.use("/api/admin", adminRoutes);
app.use("/api/serviceprovider", serviceProviderRoutes);

// if no routes found
app.all("*", (req, res, next) => {
  res.status(404).json({
    message: `No route found for ${req.originalUrl}`,
  });
});

app.use(ErrorController);
module.exports = app;
