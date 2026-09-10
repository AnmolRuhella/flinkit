import * as userRepo from "../repository/user.repository.js";
import { toPublicUser } from "./helpers.js";

/** Get all users */
export async function getAllUsers() {
  const users = await userRepo.findAll();
  return users.map(toPublicUser);
}
