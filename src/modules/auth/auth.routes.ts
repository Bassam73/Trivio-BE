import express from "express";
import { login, signUp, verifyCode } from "./auth.controller";
import valid from "express-joi-validation";
import { loginVal, signUpVal, verifyUserVal } from "./auth.validation";
const authRouter = express.Router();
const validator = valid.createValidator();

authRouter.post("/signup", validator.body(signUpVal), signUp);
authRouter.post("/login", validator.body(loginVal), login);
authRouter.patch("/verify-code", validator.body(verifyUserVal), verifyCode);
export default authRouter;
