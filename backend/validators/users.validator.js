import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const createUserSchema = Joi.object({
  name: Joi.string().min(4).required(),

  email: Joi.string().email().required(),

  password: passwordComplexity().required(),
});

export const validateCreateUser = (data) => {
  return createUserSchema.validate(data);
};
