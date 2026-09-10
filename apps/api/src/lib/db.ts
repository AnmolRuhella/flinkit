import mongoose from "mongoose";
import { env } from "../config/env.js";

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDb(): Promise<void> {
  const label = "[flinkit]";

  if (isDbConnected()) {
    console.log(`${label} Already connected (${mongoose.connection.name})`);
    return;
  }

  console.log(`${label} Connecting to MongoDB...`);

  try {
    await mongoose.connect(env.MONGODB_URI);
    await mongoose.connection.db?.admin().command({ ping: 1 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${label} Connection failed: ${message}`);
    throw error;
  }
  console.log(`${label} Connected successfully`);
}

export async function disconnectDb(): Promise<void> {
  const label = "[db]";

  if (!isDbConnected()) {
    console.log(`${label} Already disconnected`);
    return;
  }

  const name = mongoose.connection.name;
  console.log(`${label} Disconnecting from "${name}"...`);
  await mongoose.disconnect();
  console.log(`${label} Disconnected`);
}
