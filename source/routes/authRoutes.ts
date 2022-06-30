import * as authController from "../controllers/authController";
import * as jwtAuth from "../middleware/jwtAuth";
import express from "express";
import cors from "cors";
import { body } from "express-validator/check";

const router = express.Router();
router.use(cors());

router.post(
  "/register",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address!")
    .normalizeEmail(),
  body("password", "Please Enter a valid Password!")
    .isLength({ min: 5 })
    .trim(),
  authController.Signup
);

router.post(
  "/login",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address!")
    .normalizeEmail(),
  body("password", "Please Enter a valid Password!")
    .isLength({ min: 5 })
    .trim(),
  authController.Login
);

router.post(
  "/generateOTP",
  body("phone_number")
    .isMobilePhone("any")
    .withMessage("Please enter a valid phone number!"),
  authController.generateOTP
);

router.post(
  "/verifyOTP",
  body("phone_number")
    .isMobilePhone("any")
    .withMessage("Please enter a valid phone number!"),
  body("otpValue").isLength({ min: 4, max: 4 }).withMessage("Enter Valid OTP!"),
  jwtAuth.jwtAuth,
  authController.verifyOTP
);

router.post(
  "/otpLogin",
  body("phone_number")
    .isMobilePhone("any")
    .withMessage("Please enter a valid phone number!"),
  body("otpValue").isLength({ min: 4, max: 4 }).withMessage("Enter Valid OTP!"),
  authController.otpLogin
);

router.post("/refreshToken", authController.refreshToken);

router.post(
  "/resetPasswordLink",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address!")
    .normalizeEmail(),
  authController.resetPasswordLink
);

router.get("/resetPassword/:token", authController.getNewPassword);

router.post(
  "/new-password",
  body("password", "Please Enter a valid Password!")
    .isLength({ min: 5 })
    .trim(),
  authController.postNewPassword
);

router.post("/logout", jwtAuth.jwtAuth, authController.Logout);

export default router;
