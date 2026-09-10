import type { FilterQuery } from "mongoose";
import { User, type UserDocument, type UserRole } from "../../models/user.model.js";

export type UserFilter = FilterQuery<UserDocument>;

export type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
};

/** Find one user by filter (e.g. email) */
export async function findOne(
  filter: UserFilter,
  options?: { withPassword?: boolean }
) {
  const query = User.findOne(filter);
  if (options?.withPassword) {
    query.select("+passwordHash");
  }
  return query.exec();
}

/** Find all users (newest first) */
export async function findAll(filter: UserFilter = {}) {
  return User.find(filter).sort({ createdAt: -1 }).exec();
}

/** Find user by id */
export async function findById(id: string) {
  return User.findById(id).exec();
}

/** Create a user document */
export async function create(data: CreateUserData) {
  return User.create(data);
}
