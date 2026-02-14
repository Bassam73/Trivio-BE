import Joi from "joi";
import { GroupPrivacy } from "../../types/group.types";

export const createGroupVal = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  privacy: Joi.string()
    .valid(...Object.values(GroupPrivacy))
    .required(),
  logo: Joi.string(),
  tags: Joi.array().items(Joi.string()),
});

export const paramsIdVal = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const updateGroupVal = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  privacy: Joi.string().valid(...Object.values(GroupPrivacy)),
  logo: Joi.string(),
  tags: Joi.array().items(Joi.string()),
});

export const paramsRequestIdVal = Joi.object({
  id: Joi.string().hex().length(24).required(),
  requestId: Joi.string().hex().length(24).required(),
});

export const changeMemberRoleVal = Joi.object({
  targetUserId: Joi.string().hex().length(24).required(),
  newRole: Joi.string().valid("admin", "moderator", "member").required(),
});

export const memberActionVal = Joi.object({
  targetUserId: Joi.string().hex().length(24).required(),
});

export const createGroupPostVal = Joi.object({
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

export const paramsGroupPostVal = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  id: Joi.string().hex().length(24).required(),
});

export const updateGroupPostVal = Joi.object({
  caption: Joi.string().allow("", null).required(),
});
