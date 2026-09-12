import * as userRepo from "../../auth/repository/user.repository.js";
import { AuthError } from "../../auth/errors.js";
import { toPublicUser } from "../../auth/service/helpers.js";

/** SUPERADMIN: get one user by id */
export async function getUserById(id: string) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new AuthError("User not found", 404);
  }
  return toPublicUser(user);
}
