import Joi from "joi";

const createMessageSchema = Joi.object({
  chatId: Joi.string().allow(""),
  model: Joi.string().min(3).max(32_000).required(),
  content: Joi.string().required(),
});

export const validateCreateMessage = (data) => {
  return createMessageSchema.validate(data);
};
