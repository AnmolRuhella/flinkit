import bcrypt from "bcrypt";
import * as userRepo from "../repository/user.repository.js";
import { AuthError } from "../errors.js";
import type { LoginInput } from "../schema.js";
import { signAccessToken, toPublicUser } from "./helpers.js";

/** Login with email + password */
export async function loginUser(input: LoginInput) {
  const user = await userRepo.findOne(
    { email: input.email.toLowerCase() },
    { withPassword: true }
  );

  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AuthError("Invalid email or password", 401);
  }

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user._id.toString(), user.role),
  };
}
