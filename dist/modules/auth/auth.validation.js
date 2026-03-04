"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLoginVal = exports.resendVerificationCodeVal = exports.changePasswordVal = exports.forgetPasswordVal = exports.requestOTPVal = exports.verifyUserVal = exports.loginVal = exports.signUpVal = void 0;
const joi_1 = __importDefault(require("joi"));
const signUpVal = joi_1.default.object({
    username: joi_1.default.string().min(3).max(20).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .required(),
});
exports.signUpVal = signUpVal;
const loginVal = joi_1.default.object({
    username: joi_1.default.string().min(3).max(20),
    email: joi_1.default.string().email(),
    password: joi_1.default.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .required(),
});
exports.loginVal = loginVal;
const verifyUserVal = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    code: joi_1.default.string().min(6).max(6).required(),
});
exports.verifyUserVal = verifyUserVal;
const requestOTPVal = joi_1.default.object({
    email: joi_1.default.string().email().required(),
});
exports.requestOTPVal = requestOTPVal;
const forgetPasswordVal = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    otp: joi_1.default.string().min(6).max(6).required(),
    password: joi_1.default.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .required(),
});
exports.forgetPasswordVal = forgetPasswordVal;
const changePasswordVal = joi_1.default.object({
    currentPassword: joi_1.default.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .required(),
    newPassword: joi_1.default.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .required(),
});
exports.changePasswordVal = changePasswordVal;
const resendVerificationCodeVal = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    username: joi_1.default.string().min(3).max(20).required(),
});
exports.resendVerificationCodeVal = resendVerificationCodeVal;
const googleLoginVal = joi_1.default.object({
    idToken: joi_1.default.string().required(),
});
exports.googleLoginVal = googleLoginVal;
