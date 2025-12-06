import Joi from "joi";
import mongoose from "mongoose";
import { ReactionType } from "../../types/like.types";

function isValidObjectId(value: string, helpers: any) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
    }
    return value;
}

const REACTION_TYPES: ReactionType[] = [
    "like", "love", "haha", "wow", "sad", "angry"
];

export const toggleLikeVal = Joi.object({
    user: Joi.string().custom(isValidObjectId).required(),

    post: Joi.string().custom(isValidObjectId)
        .when("comment", { is: Joi.exist(), then: Joi.forbidden() }),

    comment: Joi.string().custom(isValidObjectId)
        .when("post", { is: Joi.exist(), then: Joi.forbidden() }),

    type: Joi.string().valid(...REACTION_TYPES).required(),
});
