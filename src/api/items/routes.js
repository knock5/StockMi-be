const routes = (handler) => [
  {
    method: "GET",
    path: "/items",
    handler: handler.getAllItemsHandler,
  },
  {
    method: "POST",
    path: "/items",
    handler: handler.postItemHandler,
  },
  {
    method: "GET",
    path: "/items/{id}",
    handler: handler.getItemByIdHandler,
  },
  {
    method: "PUT",
    path: "/items/{id}",
    handler: handler.editItemByIdHandler,
  },
  {
    method: "DELETE",
    path: "/items/{id}",
    handler: handler.deleteItemByIdHandler,
  },
];

export default routes;
