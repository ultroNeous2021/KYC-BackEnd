const express = require("express");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const {
  validateUserSignin,
  validateUserSignup,
  validateNewConfirmPassword,
} = require("../utils/validator");

const router = express.Router();

router.get('/getallcustomers', authController.protect, adminController.getAllCustomers)
router.get('/getAllServiceProviders', authController.protect, adminController.getAllServiceProviders)
router.post('/blockuser', authController.protect, adminController.blockUnblockUser)
router.post(
  "/addQuestion",
  authController.protect,
  adminController.addQuestion
);

module.exports = router;
