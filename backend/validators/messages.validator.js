import Joi from "joi";

const createMessageSchema = Joi.object({
  chatId: Joi.number(),
  model: Joi.string().min(4).required(),
  content: Joi.string().required(),
});

export const validateCreateMessage = (data) => {
  return createMessageSchema.validate(data);
};
