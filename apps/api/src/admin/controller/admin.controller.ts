import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AuthError } from "../../auth/errors.js";
import { getUserById } from "../service/get.js";
import { getAllUsers } from "../service/getAll.js";

function handleError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  if (error instanceof AuthError) {
    return reply.status(error.statusCode).send({ message: error.message });
  }
  throw error;
}

export async function listUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await getAllUsers();
    return reply.status(200).send({ users, count: users.length });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const user = await getUserById(id);
    return reply.status(200).send({ user });
  } catch (error) {
    return handleError(error, reply);
  }
}
