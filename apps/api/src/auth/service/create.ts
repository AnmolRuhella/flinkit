import bcrypt from "bcrypt";
import * as userRepo from "../repository/user.repository.js";
import { AuthError } from "../errors.js";
import type { RegisterInput } from "../schema.js";
import { signAccessToken, toPublicUser } from "./helpers.js";

const SALT_ROUNDS = 10;

/** Register a new user (CUSTOMER | SELLER | AGENT) */
export async function createUser(input: RegisterInput) {
  const existing = await userRepo.findOne({
    email: input.email.toLowerCase(),
  });
  if (existing) {
    throw new AuthError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await userRepo.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role,
    phone: input.phone,
  });

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user._id.toString(), user.role),
  };
}
