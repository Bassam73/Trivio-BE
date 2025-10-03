import express from "express";
import { signUp } from "./auth.controller";
import valid from "express-joi-validation";
import { signUpVal } from "./auth.validation";
const authRouter = express.Router();
const validator = valid.createValidator();

authRouter.post("/signup", validator.body(signUpVal), signUp);
export default authRouter;


