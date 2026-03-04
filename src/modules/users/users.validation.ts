import Joi from "joi";

const jsonStringArray = (value: string, helpers: Joi.CustomHelpers) => {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item: any) => typeof item === "string")) {
      return value;
    }
    return helpers.error("any.invalid");
  } catch (error) {
    return helpers.error("any.invalid");
  }
};

export const paramsIdVal = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const changePasswordVal = Joi.object({
  currentPassword: Joi.string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .required(),
  newPassword: Joi.string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .required(),
})
export const removeFavTeamVal = Joi.object({
  teams: Joi.array().items(Joi.string()).max(50).required(),
});
export const removeFavPlayerVal = Joi.object({
  players: Joi.array().items(Joi.string()).max(50).required(),
});

export const updateProfileVal = Joi.object({
  username: Joi.string().
    // alphanum().
    min(3).max(20),
  email: Joi.string().email(),
  bio: Joi.string().max(160),
  avatar: Joi.string(),
  favTeams: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().custom(jsonStringArray)),
  favPlayers: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().custom(jsonStringArray)),
});
