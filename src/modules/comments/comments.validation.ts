import Joi from "joi";

export const updateCommentSchema = Joi.object({
  text: Joi.string().required(),
}).required();

export const createReplySchema = Joi.object({
  text: Joi.string().required(),
}).required();
