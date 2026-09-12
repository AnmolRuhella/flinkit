import type { FastifyPluginAsync } from "fastify";
import {
  authenticate,
  authorizeRoles,
} from "../../auth/middleware/authenticate.js";
import * as shopController from "../controller/shop.controller.js";

export const shopsRouter: FastifyPluginAsync = async (app) => {
  // Public browse — register static /me routes before /:id
  app.get("/", shopController.listShops);

  app.get(
    "/me",
    { preHandler: [authenticate, authorizeRoles("SELLER")] },
    shopController.getMyShop
  );
  app.post(
    "/me",
    { preHandler: [authenticate, authorizeRoles("SELLER")] },
    shopController.upsertMyShop
  );
  app.get(
    "/me/products",
    { preHandler: [authenticate, authorizeRoles("SELLER")] },
    shopController.listMyProducts
  );
  app.post(
    "/me/products",
    { preHandler: [authenticate, authorizeRoles("SELLER")] },
    shopController.createMyProduct
  );
  app.patch(
    "/me/products/:id",
    { preHandler: [authenticate, authorizeRoles("SELLER")] },
    shopController.updateMyProduct
  );

  app.get("/:id", shopController.getShop);
  app.get("/:id/products", shopController.getShopProducts);
};
