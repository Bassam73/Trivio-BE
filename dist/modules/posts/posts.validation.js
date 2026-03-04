"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostByIdVal = exports.paramsIdVal = exports.createPostVal = void 0;
const joi_1 = __importDefault(require("joi"));
const post_types_1 = require("../../types/post.types");
const createPostVal = joi_1.default.object({
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
exports.createPostVal = createPostVal;
const paramsIdVal = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required(),
});
exports.paramsIdVal = paramsIdVal;
const updatePostByIdVal = joi_1.default.object({
    caption: joi_1.default.string().allow("", null),
    type: joi_1.default.string().valid(...Object.values(post_types_1.PostType)),
}).custom((value, helpers) => {
    if (!value.caption && !value.type) {
        return helpers.error("any.required");
    }
    return value;
});
exports.updatePostByIdVal = updatePostByIdVal;
