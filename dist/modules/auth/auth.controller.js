"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.resendVerificationCode = exports.changePassword = exports.forgetPassword = exports.requestOTP = exports.verifyCode = exports.login = exports.signUp = void 0;
const catchError_1 = __importDefault(require("../../core/middlewares/catchError"));
const auth_service_1 = __importDefault(require("./auth.service"));
const service = auth_service_1.default.getInstance();
const signUp = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    const user = await service.signup(data);
    res.status(201).json({ status: "success", data: [user] });
});
exports.signUp = signUp;
const login = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    const token = await service.login(data);
    res.status(200).json({ status: "success", data: [token] });
});
exports.login = login;
const verifyCode = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    await service.verfiyAccount(data);
    res.status(200).json({ status: "success" });
});
exports.verifyCode = verifyCode;
const requestOTP = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    await service.requestOTP(data);
    res.status(200).json({ status: "success" });
});
exports.requestOTP = requestOTP;
const forgetPassword = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    const user = await service.forgetPassword(data);
    res.status(200).json({ status: "success", data: [user] });
});
exports.forgetPassword = forgetPassword;
const changePassword = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    data.savedPassword = req.user?.password;
    data.id = req.user?.id;
    const user = await service.changePassword(data);
    res.status(200).json({ status: "success", data: [user] });
});
exports.changePassword = changePassword;
const resendVerificationCode = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    await service.changeEmailInVerify(data);
    res.status(200).json({ status: "success" });
});
exports.resendVerificationCode = resendVerificationCode;
const googleLogin = (0, catchError_1.default)(async (req, res, next) => {
    const token = await service.googleLogin(req.body.idToken);
    res.status(200).json({ status: "success", data: [token] });
});
exports.googleLogin = googleLogin;
