"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGroupMember = void 0;
const groups_repo_1 = __importDefault(require("../../modules/groups/groups.repo"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const isGroupMember = async (req, res, next) => {
    const groupId = req.params.id;
    const userId = req.user?.id;
    const group = await groups_repo_1.default.getInstance().getGroupById(groupId);
    if (!group)
        throw new AppError_1.default("group not found", 404);
    const status = await groups_repo_1.default.getInstance().checkMemberStatus(groupId, userId);
    if (status == "banned")
        throw new AppError_1.default("You are banned from this group", 403);
    if (!status)
        throw new AppError_1.default("You are not a member of this group", 403);
    next();
};
exports.isGroupMember = isGroupMember;
