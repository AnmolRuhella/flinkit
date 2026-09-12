import cors from "@fastify/cors";
import Fastify from "fastify";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { isDbConnected } from "./lib/db.js";
import { authRouter } from "./auth/router/index.js";
import { adminRouter } from "./admin/router/index.js";
import { ordersRouter } from "./orders/router/index.js";
import { shopsRouter } from "./shops/router/index.js";
import { productsRouter } from "./products/router/index.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Allow POST with Content-Type: application/json and empty body (e.g. /confirm)
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (req, body, done) => {
      if (!body || body.length === 0) {
        done(null, {});
        return;
      }
      try {
        done(null, JSON.parse(body as string));
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.get("/health", async () => ({
    status: "ok",
    db: {
      connected: isDbConnected(),
      database: isDbConnected() ? mongoose.connection.name : null,
    },
  }));

  await app.register(authRouter, { prefix: "/auth" });
  await app.register(adminRouter, { prefix: "/admin" });
  await app.register(ordersRouter, { prefix: "/orders" });
  await app.register(shopsRouter, { prefix: "/shops" });
  await app.register(productsRouter, { prefix: "/products" });

  return app;
}
