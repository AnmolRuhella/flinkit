import type { FastifyPluginAsync } from "fastify";
import * as shopController from "../../shops/controller/shop.controller.js";

export const productsRouter: FastifyPluginAsync = async (app) => {
  app.get("/search", shopController.searchProducts);
};
