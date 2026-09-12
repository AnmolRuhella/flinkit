import type { FastifyPluginAsync } from "fastify";
import {
  authenticate,
  authorizeRoles,
} from "../../auth/middleware/authenticate.js";
import * as adminController from "../controller/admin.controller.js";

const requireSuperAdmin = [authenticate, authorizeRoles("SUPERADMIN")];

export const adminRouter: FastifyPluginAsync = async (app) => {
  app.get("/users", { preHandler: requireSuperAdmin }, adminController.listUsers);
  app.get(
    "/users/:id",
    { preHandler: requireSuperAdmin },
    adminController.getUser
  );
};
