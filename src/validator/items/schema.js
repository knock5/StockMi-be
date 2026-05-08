import Joi from "joi";

const ItemPayloadSchema = Joi.object({
  name: Joi.string().max(100).required(),
  sku: Joi.string().max(50).optional(),
  brand: Joi.string().max(100),
  unit: Joi.string().max(50).required(),
  imageUrl: Joi.string().uri(),
});

export { ItemPayloadSchema };
