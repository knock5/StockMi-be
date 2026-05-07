import InvariantError from "../../exceptions/InvariantError.js";
import { ItemPayloadSchema } from "./schema.js";

const ItemValidator = {
  validateItemPayload: (payload) => {
    const validationResult = ItemPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export { ItemValidator };
