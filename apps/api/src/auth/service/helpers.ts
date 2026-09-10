import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export function toPublicUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  createdAt?: Date;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? undefined,
    createdAt: user.createdAt,
  };
}

export function signAccessToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: "7d",
  });
}
