"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLikeVal = void 0;
const joi_1 = __importDefault(require("joi"));
const mongoose_1 = __importDefault(require("mongoose"));
function isValidObjectId(value, helpers) {
    if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
    }
    return value;
}
const REACTION_TYPES = [
    "like", "love", "haha", "wow", "sad", "angry"
];
exports.toggleLikeVal = joi_1.default.object({
    user: joi_1.default.string().custom(isValidObjectId).required(),
    post: joi_1.default.string().custom(isValidObjectId)
        .when("comment", { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
    comment: joi_1.default.string().custom(isValidObjectId)
        .when("post", { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
    type: joi_1.default.string().valid(...REACTION_TYPES).required(),
});
