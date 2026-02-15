"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGroupRole = void 0;
const AppError_1 = __importDefault(require("../utils/AppError"));
const catchError_1 = __importDefault(require("./catchError"));
const groupMember_model_1 = __importDefault(require("../../database/models/groupMember.model"));
const checkGroupRole = (roles) => {
    return (0, catchError_1.default)(async (req, res, next) => {
        const { groupId } = req.params;
        const userId = req.user._id;
        if (!groupId) {
            return next(new AppError_1.default("Group ID is required", 400));
        }
        const member = await groupMember_model_1.default.findOne({ groupId, userId });
        if (!member) {
            return next(new AppError_1.default("You are not a member of this group", 403));
        }
        if (member.status === "banned") {
            return next(new AppError_1.default("You are banned from this group", 403));
        }
        if (!roles.includes(member.role)) {
            return next(new AppError_1.default(`Access denied. Allowed roles: ${roles.join(", ")}`, 403));
        }
        // Attach member to request for future use if needed
        // (req as any).groupMember = member;
        next();
    });
};
exports.checkGroupRole = checkGroupRole;
