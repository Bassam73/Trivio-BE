"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGroupPostVal = exports.paramsGroupPostVal = exports.createGroupPostVal = exports.memberActionVal = exports.changeMemberRoleVal = exports.paramsRequestIdVal = exports.updateGroupVal = exports.paramsIdVal = exports.createGroupVal = void 0;
const joi_1 = __importDefault(require("joi"));
const group_types_1 = require("../../types/group.types");
exports.createGroupVal = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    privacy: joi_1.default.string()
        .valid(...Object.values(group_types_1.GroupPrivacy))
        .required(),
    logo: joi_1.default.string(),
    tags: joi_1.default.array().items(joi_1.default.string()),
});
exports.paramsIdVal = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required(),
});
exports.updateGroupVal = joi_1.default.object({
    name: joi_1.default.string(),
    description: joi_1.default.string(),
    privacy: joi_1.default.string().valid(...Object.values(group_types_1.GroupPrivacy)),
    logo: joi_1.default.string(),
    tags: joi_1.default.array().items(joi_1.default.string()),
});
exports.paramsRequestIdVal = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required(),
    requestId: joi_1.default.string().hex().length(24).required(),
});
exports.changeMemberRoleVal = joi_1.default.object({
    targetUserId: joi_1.default.string().hex().length(24).required(),
    newRole: joi_1.default.string().valid("admin", "moderator", "member").required(),
});
exports.memberActionVal = joi_1.default.object({
    targetUserId: joi_1.default.string().hex().length(24).required(),
});
exports.createGroupPostVal = joi_1.default.object({
    caption: joi_1.default.string().allow("", null),
    media: joi_1.default.array().items(joi_1.default.string()).optional(),
    authorID: joi_1.default.string().required(),
    flagged: joi_1.default.boolean().optional(),
    mentions: joi_1.default.array().optional(),
}).custom((value, helpers) => {
    if (!value.caption && (!value.media || value.media.length === 0)) {
        return helpers.error("any.required");
    }
    return value;
});
exports.paramsGroupPostVal = joi_1.default.object({
    postId: joi_1.default.string().hex().length(24).required(),
    id: joi_1.default.string().hex().length(24).required(),
});
exports.updateGroupPostVal = joi_1.default.object({
    caption: joi_1.default.string().allow("", null).required(),
});
