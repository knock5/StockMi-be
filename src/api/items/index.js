import ItemHandler from "./handler.js";
import routes from "./routes.js";

export default {
  name: "items",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const itemHandler = new ItemHandler(service, validator);
    server.route(routes(itemHandler));
  },
};
