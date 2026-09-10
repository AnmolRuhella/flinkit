import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { USER_ROLES, type UserRole } from "../../models/user.model.js";
import { AuthError } from "../errors.js";
import * as userRepo from "../repository/user.repository.js";
import type { JwtPayload } from "../types.js";

function getBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim() || null;
}

/** Require logged-in (registered) user — JWT must be valid */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      throw new AuthError("Missing or invalid Authorization header", 401);
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch {
      throw new AuthError("Invalid or expired token", 401);
    }

    if (!payload.sub || !USER_ROLES.includes(payload.role as UserRole)) {
      throw new AuthError("Invalid token payload", 401);
    }

    // Ensure user still exists in DB (registered account)
    const user = await userRepo.findById(payload.sub);
    if (!user) {
      throw new AuthError("User not found or no longer registered", 401);
    }

    request.user = {
      id: user._id.toString(),
      role: user.role as UserRole,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    throw error;
  }
}

/** Optional: only allow specific roles (use after authenticate) */
export function authorizeRoles(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        message: `Forbidden — requires role: ${roles.join(" | ")}`,
      });
    }
  };
}
