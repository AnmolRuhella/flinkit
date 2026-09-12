import * as userRepo from "../../auth/repository/user.repository.js";
import { toPublicUser } from "../../auth/service/helpers.js";

/** SUPERADMIN: list all users */
export async function getAllUsers() {
  const users = await userRepo.findAll();
  return users.map(toPublicUser);
}
