import * as userRepo from "../repository/user.repository.js";
import { AuthError } from "../errors.js";
import { toPublicUser } from "./helpers.js";

/** Get user by id */
export async function getUserById(id: string) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new AuthError("User not found", 404);
  }
  return toPublicUser(user);
}
