import Hapi from "@hapi/hapi";
import dotenv from "dotenv";

dotenv.config();
import { env } from "prisma/config";

const init = async () => {
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

  server.ext("onPreResponse", (request, h) => {
    const response = request.response;

    if (response.isBoom) {
      const errorResponse = {
        statusCode: response.output.statusCode,
        error: response.output.payload.error,
        message: response.message,
      };

      return h.response(errorResponse).code(response.output.statusCode);
    }

    return h.continue;
  });

  await server.start();

  console.log("✓ Server running on %s", server.info.uri);
};

init();
