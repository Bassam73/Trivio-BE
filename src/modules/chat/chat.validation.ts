import Joi from "joi";

export const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required().messages({
    "string.empty": "Message content cannot be empty.",
    "string.max": "Message content must not exceed 2000 characters.",
    "any.required": "Message content is required.",
  }),
});

export const getMessagesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
