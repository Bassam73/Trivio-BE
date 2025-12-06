"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../utils/AppError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchError_1 = __importDefault(require("./catchError"));
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const protectedRoutes = (0, catchError_1.default)(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new AppError_1.default("You are not logged in! Please log in to get access.", 401));
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return next(new AppError_1.default("Server configuration error: JWT secret is not defined.", 500));
    }
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    if (!decoded || !decoded.id) {
        return next(new AppError_1.default("Invalid token payload.", 401));
    }
    const user = await user_model_1.default.findById(decoded.id);
    if (!user) {
        return next(new AppError_1.default("The user belonging to this token no longer exists.", 401));
    }
    if (user.passwordChangedAt) {
        const changedTimestamp = parseInt((user.passwordChangedAt.getTime() / 1000).toString(), 10);
        if (decoded.iat && changedTimestamp > decoded.iat) {
            return next(new AppError_1.default("User recently changed password! Please log in again.", 401));
        }
    }
    req.user = user;
    next();
});
exports.default = protectedRoutes;
