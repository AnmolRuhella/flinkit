import type { UserRole } from "../../models/user.model.js";

export type JwtPayload = {
  sub: string;
  role: UserRole;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      role: UserRole;
    };
  }
}
