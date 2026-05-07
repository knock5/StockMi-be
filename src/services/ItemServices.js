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
    const id = `item-${nanoid(16)}`;

    const generateSKU = async (name) => {
      const baseSKU = name.toUpperCase().replace(/\s+/g, "-").substring(0, 10);
      let uniqueSKU = baseSKU;
      let counter = 1;

      while (
        await this._prisma.item.findUnique({ where: { sku: uniqueSKU } })
      ) {
        uniqueSKU = `${baseSKU}-${counter}`;
        counter++;
      }

      return uniqueSKU;
    };

    if (!sku) {
      sku = await generateSKU(name);
    }

    try {
      const newItem = await this._prisma.item.create({
        data: {
          id,
          name,
          sku,
          brand,
          unit,
          imageUrl,
        },
      });

      return newItem.id;
    } catch (error) {
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

  async editItem(id, { name, sku, brand, unit, imageUrl }) {
    const item = await this._prisma.item.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    try {
      await this._prisma.item.update({
        where: { id },
        data: {
          name,
          sku,
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
