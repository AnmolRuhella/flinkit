import type { FastifyPluginAsync } from "fastify";
import * as authController from "../controller/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const authRouter: FastifyPluginAsync = async (app) => {
  // Public — no token needed
  app.post("/register", authController.register);
  app.post("/login", authController.login);

  // Protected — only registered + logged-in users
  app.get("/users", { preHandler: [authenticate] }, authController.getAll);
  app.get("/users/:id", { preHandler: [authenticate] }, authController.getMe);
  app.get("/me", { preHandler: [authenticate] }, authController.getProfile);
};
