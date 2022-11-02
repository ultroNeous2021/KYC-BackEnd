const express = require("express");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

const router = express.Router();

router
  .get(
    "/getallcustomers",
    authController.protect,
    adminController.getAllCustomers
  )
  .post("/getallcustomers", adminController.getAllCustomers);
router
  .get(
    "/getAllServiceProviders",
    authController.protect,
    adminController.getAllServiceProviders
  )
  .post(
    "/getAllServiceProviders",
    authController.protect,
    adminController.getAllServiceProviders
  );
router.post(
  "/blockuser",
  authController.protect,
  adminController.blockUnblockUser
);
router.post(
  "/addQuestion",
  authController.protect,
  adminController.addQuestion
);
router.post("/search", authController.protect, adminController.search);
router.post(
  "/deleteReview",
  authController.protect,
  adminController.deleteReview
);

module.exports = router;
