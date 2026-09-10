import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./lib/db.js";

async function main() {
  await connectDb();
  const app = await buildApp();

  const shutdown = async () => {
    await app.close();
    await disconnectDb();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
