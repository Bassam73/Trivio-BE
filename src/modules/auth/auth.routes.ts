import express from "express";
import {
  changePassword,
  forgetPassword,
  googleLogin,
  login,
  requestOTP,
  resendVerificationCode,
  signUp,
  verifyCode,
} from "./auth.controller";
import valid from "express-joi-validation";
import {
  changePasswordVal,
  forgetPasswordVal,
  googleLoginVal,
  loginVal,
  requestOTPVal,
  resendVerificationCodeVal,
  signUpVal,
  verifyUserVal,
} from "./auth.validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
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
authRouter.patch(
  "/change-password",
  protectedRoutes,
  validator.body(changePasswordVal),
  changePassword
);

authRouter.patch(
  "/resend-verification-code",
  validator.body(resendVerificationCodeVal),
  resendVerificationCode
);
authRouter.post("/google-login", validator.body(googleLoginVal), googleLogin);
export default authRouter;
