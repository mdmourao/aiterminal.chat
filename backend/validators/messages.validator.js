import Joi from "joi";

const createMessageSchema = Joi.object({
  chatId: Joi.string().allow(""),
  model: Joi.string().required(),
  content: Joi.string().max(32_000).required(),
});

export const validateCreateMessage = (data) => {
  return createMessageSchema.validate(data);
};
