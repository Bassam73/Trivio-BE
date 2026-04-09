import Joi from "joi";

const paramsIdVal = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
