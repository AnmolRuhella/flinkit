import cors from "@fastify/cors";
import Fastify from "fastify";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { isDbConnected } from "./lib/db.js";
import { authRouter } from "./auth/router/index.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: env.CORS_ORIGIN });

  app.get("/health", async () => ({
    status: "ok",
    db: {
      connected: isDbConnected(),
      database: isDbConnected() ? mongoose.connection.name : null,
    },
  }));

  await app.register(authRouter, { prefix: "/auth" });

  return app;
}
