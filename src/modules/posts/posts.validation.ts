import Joi from "joi";
import { PostType } from "../../types/post.types";

const createPostVal = Joi.object({
  caption: Joi.string().allow("", null),
  media: Joi.array().items(Joi.string()).optional(),
  authorID: Joi.string().required(),
  flagged: Joi.boolean().optional(),
  mentions: Joi.array().optional(),
}).custom((value, helpers) => {
  if (!value.caption && (!value.media || value.media.length === 0)) {
    return helpers.error("any.required");
  }
  return value;
});

const paramsIdVal = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updatePostByIdVal = Joi.object({
  caption: Joi.string().allow("", null),
  type: Joi.string().valid(...Object.values(PostType)),
}).custom((value, helpers) => {
  if (!value.caption && !value.type) {
    return helpers.error("any.required");
  }
  return value;
});
export { createPostVal, paramsIdVal, updatePostByIdVal };
