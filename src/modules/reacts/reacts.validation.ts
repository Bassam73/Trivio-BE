import Joi from "joi";
import { ReactionType } from "../../types/reaction.types";

export const reactsParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const updateReactionBodySchema = Joi.object({
  reaction: Joi.string().valid(...Object.values(ReactionType)).required(),
});

export const createReactionSchema = Joi.object({
  reaction: Joi.string().valid(...Object.values(ReactionType)).required(),
});
