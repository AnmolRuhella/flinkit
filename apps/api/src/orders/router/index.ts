import type { FastifyPluginAsync } from "fastify";
import {
  authenticate,
  authorizeRoles,
} from "../../auth/middleware/authenticate.js";
import * as orderController from "../controller/order.controller.js";

export const ordersRouter: FastifyPluginAsync = async (app) => {
  // Customer places order
  app.post(
    "/",
    { preHandler: [authenticate, authorizeRoles("CUSTOMER")] },
    orderController.create
  );

  app.get("/", { preHandler: [authenticate] }, orderController.list);

  // Agent: orders waiting after shop accept (before /:id)
  app.get(
    "/available",
    { preHandler: [authenticate, authorizeRoles("AGENT")] },
    orderController.listAvailable
  );

  app.get("/:id", { preHandler: [authenticate] }, orderController.getOne);

  // Shop accepts
  app.post(
    "/:id/confirm",
    { preHandler: [authenticate, authorizeRoles("SELLER")] },
    orderController.confirm
  );

  // Delivery boy accepts (atomic claim)
  app.post(
    "/:id/accept",
    { preHandler: [authenticate, authorizeRoles("AGENT")] },
    orderController.accept
  );

  app.patch(
    "/:id/status",
    { preHandler: [authenticate] },
    orderController.updateStatus
  );
};
