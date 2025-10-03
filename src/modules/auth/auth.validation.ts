import Joi from "joi";

const signUpVal = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .required(),
  confirm_password: Joi.string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .required(),
});

export { signUpVal };
