import express from "express";
import {
  forgetPassword,
  login,
  requestOTP,
  signUp,
  verifyCode,
} from "./auth.controller";
import valid from "express-joi-validation";
import {
  forgetPasswordVal,
  loginVal,
  requestOTPVal,
  signUpVal,
  verifyUserVal,
} from "./auth.validation";
const authRouter = express.Router();
const validator = valid.createValidator();

authRouter.post("/signup", validator.body(signUpVal), signUp);
authRouter.post("/login", validator.body(loginVal), login);
authRouter.patch("/verify-code", validator.body(verifyUserVal), verifyCode);
authRouter.patch("/request-otp", validator.body(requestOTPVal), requestOTP);
authRouter.patch(
  "/forget-password",
  validator.body(forgetPasswordVal),
  forgetPassword
);
export default authRouter;
