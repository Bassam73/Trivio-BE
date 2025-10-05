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

const loginVal = Joi.object({
  username: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  password: Joi.string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .required(),
});

const verifyUserVal = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().min(6).max(6).required(),
});
export { signUpVal, loginVal, verifyUserVal };
