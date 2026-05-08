import autoBind from "auto-bind";
import ClientError from "../../exceptions/ClientError.js";

class ItemService {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getAllItemsHandler(request, h) {
    try {
      const items = await this._service.getAllItems();
      const response = h.response({
        status: "success",
        data: {
          items,
        },
      });
      response.code(200);

      return response;
    } catch (error) {
      console.error("Error in getAllItemsHandler:", error);
      throw error;
    }
  }

  async getItemByIdHandler(request, h) {
    const { id } = request.params;
    const item = await this._service.getItems(id);

    const response = h.response({
      status: "success",
      data: {
        item,
      },
    });
    response.code(200);

    return response;
  }

  async postItemHandler(request, h) {
    this._validator.validateItemPayload(request.payload);

    const { name, brand, unit, imageUrl } = request.payload;

    const itemId = await this._service.addItem({
      name,
      brand,
      unit,
      imageUrl,
    });

    const response = h.response({
      status: "success",
      message: "Item added successfully",
      data: {
        itemId,
      },
    });

    response.code(201);

    return response;
  }

  async editItemByIdHandler(request, h) {
    this._validator.validateItemPayload(request.payload);
    const { id } = request.params;
    const { name, brand, unit, imageUrl } = request.payload;

    await this._service.editItem(id, {
      name,
      brand,
      unit,
      imageUrl,
    });

    const response = h.response({
      status: "success",
      message: "Item updated successfully",
    });
    response.code(200);

    return response;
  }

  async deleteItemByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteItem(id);

    const response = h.response({
      status: "success",
      message: "Item deleted successfully",
    });
    response.code(200);

    return response;
  }
}

export default ItemService;
