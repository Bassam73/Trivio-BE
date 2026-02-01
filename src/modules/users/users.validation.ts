import Joi from "joi";

export const paramsIdVal = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
