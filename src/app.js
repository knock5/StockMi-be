import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import ClientError from "./exceptions/ClientError.js";
dotenv.config();
import { env } from "prisma/config";
import { prisma } from "./config/db.js";

// plugins
import items from "./api/items/index.js";

// services
import { ItemServices } from "./services/ItemServices.js";

// validators
import { ItemValidator } from "./validator/items/index.js";

const init = async () => {
  const itemServices = new ItemServices();

  const server = Hapi.server({
    port: env("PORT"),
    host: env("HOST"),
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
        exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
      },
    },
  });

  await server.register([
    {
      plugin: items,
      options: {
        service: itemServices,
        validator: ItemValidator,
      },
    },
  ]);

  // Check DB connection before starting the server
  try {
    await prisma.$connect();
    console.log("✓ Database connected");
  } catch (error) {
    console.error("DB connection failed:", error);
    // stop early if DB is not available
    process.exit(1);
  }

  server.ext("onPreResponse", (request, h) => {
    // get context response from request
    const response = request.response;

    if (response instanceof Error) {
      // handle error internal
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });

        newResponse.code(response.statusCode);

        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      // handle error server
      const newResponse = h.response({
        status: "error",
        message: "Sorry, there was a failure on our server...",
      });

      newResponse.code(500);

      return newResponse;
    }

    // continue response if not error
    return h.continue;
  });

  await server.start();

  console.log("✓ Server running on %s", server.info.uri);

  // Graceful shutdown: disconnect Prisma when process exits
  const shutdown = async () => {
    try {
      await server.stop({ timeout: 10000 });
    } catch (err) {
      console.error("Error stopping server:", err);
    }
    try {
      await prisma.$disconnect();
      console.log("✓ Database disconnected");
    } catch (err) {
      console.error("Error disconnecting DB:", err);
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

init();
