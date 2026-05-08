import { nanoid } from "nanoid";
import InvariantError from "../exceptions/InvariantError.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import { prisma } from "../config/db.js";

class ItemServices {
  constructor() {
    this._prisma = prisma;
  }

  async getAllItems() {
    try {
      console.debug("ItemServices: fetching all items");
      return await this._prisma.item.findMany();
    } catch (error) {
      console.error("Error in ItemServices.getAllItems:", error);

      // Attempt a single reconnect for transient pool errors
      const msg = (error && error.message) || "";
      if (
        msg.includes("pool timeout") ||
        msg.includes("failed to retrieve a connection")
      ) {
        try {
          console.info(
            "Attempting to reconnect Prisma client due to pool timeout...",
          );

          await this._prisma.$disconnect();
          await this._prisma.$connect();

          console.info("Reconnected Prisma client, retrying findMany...");

          return await this._prisma.item.findMany();
        } catch (retryErr) {
          console.error("Retry after reconnect failed:", retryErr);
          throw retryErr;
        }
      }

      throw error;
    }
  }

  async addItem({ name, sku, brand, unit, imageUrl }) {
    const generateSKU = (name) => {
      const prefix = name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
      const randomSuffix = nanoid(6).toUpperCase();
      return `${prefix}-${randomSuffix}`;
    };

    if (!sku) {
      sku = generateSKU(name);
    }

    try {
      const created = await this._prisma.item.create({
        data: {
          name,
          sku,
          brand,
          unit,
          imageUrl,
        },
      });

      return created.id;
    } catch (error) {
      console.error("Error in ItemServices.addItem:", error);
      throw new InvariantError("Failed to add item");
    }
  }

  async getItems(id) {
    if (id) {
      const item = await this._prisma.item.findUnique({ where: { id } });

      if (!item) {
        throw new NotFoundError("Item not found");
      }

      return item;
    }
  }

  async editItem(id, { name, brand, unit, imageUrl }) {
    const item = await this._prisma.item.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    const generateSKU = (itemName) => {
      const prefix = itemName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
      const randomSuffix = nanoid(6).toUpperCase();
      return `${prefix}-${randomSuffix}`;
    };

    // Generate new SKU if name is updated, otherwise keep existing SKU
    const newSku = name ? generateSKU(name) : item.sku;

    try {
      await this._prisma.item.update({
        where: { id },
        data: {
          name,
          sku: newSku,
          brand,
          unit,
          imageUrl,
        },
      });
    } catch (error) {
      throw new InvariantError("Failed to update item");
    }
  }

  async deleteItem(id) {
    const item = await this._prisma.item.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    try {
      await this._prisma.item.delete({ where: { id } });
    } catch (error) {
      throw new InvariantError("Failed to delete item");
    }
  }
}

export { ItemServices };
