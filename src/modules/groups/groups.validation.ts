import Joi from "joi";
import { GroupPrivacy } from "../../types/group.types";

export const createGroupVal = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
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
