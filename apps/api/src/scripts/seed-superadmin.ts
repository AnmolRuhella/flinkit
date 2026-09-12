/**
 * Seed one SUPERADMIN user (not available via public register).
 *
 * Usage:
 *   cd apps/api
 *   npm run seed:superadmin
 *
 * Optional env:
 *   SUPERADMIN_EMAIL=admin@flinkit.com
 *   SUPERADMIN_PASSWORD=Admin@12345
 *   SUPERADMIN_NAME=Flinkit Admin
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { connectDb, disconnectDb } from "../lib/db.js";
import * as userRepo from "../auth/repository/user.repository.js";

async function seedSuperAdmin() {
  const email = (process.env.SUPERADMIN_EMAIL ?? "admin@flinkit.com").toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD ?? "Admin@12345";
  const name = process.env.SUPERADMIN_NAME ?? "Flinkit Admin";

  await connectDb();

  const existing = await userRepo.findOne({ email });
  if (existing) {
    if (existing.role === "SUPERADMIN") {
      console.log(`[seed] SUPERADMIN already exists: ${email}`);
      await disconnectDb();
      return;
    }
    console.error(
      `[seed] Email already used with role ${existing.role}. Use another email.`
    );
    await disconnectDb();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.create({
    name,
    email,
    passwordHash,
    role: "SUPERADMIN",
  });

  console.log("[seed] SUPERADMIN created");
  console.log(`  id:    ${user._id.toString()}`);
  console.log(`  email: ${email}`);
  console.log(`  role:  SUPERADMIN`);
  console.log("  Use POST /auth/login with this email + password.");

  await disconnectDb();
}

seedSuperAdmin().catch(async (err) => {
  console.error("[seed] Failed:", err);
  try {
    await disconnectDb();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
