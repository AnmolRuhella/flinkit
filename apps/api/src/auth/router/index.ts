import type { FastifyPluginAsync } from "fastify";
import * as authController from "../controller/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const authRouter: FastifyPluginAsync = async (app) => {
  // Public
  app.post("/register", authController.register);
  app.post("/login", authController.login);

  // Any logged-in user
  app.get("/me", { preHandler: [authenticate] }, authController.getProfile);
};
