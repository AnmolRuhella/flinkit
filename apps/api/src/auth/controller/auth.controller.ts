import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AuthError } from "../errors.js";
import { loginSchema, registerSchema } from "../schema.js";
import { createUser } from "../service/create.js";
import { getUserById } from "../service/get.js";
import { loginUser } from "../service/login.js";

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function handleError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation failed",
      errors: formatZodError(error),
    });
  }
  if (error instanceof AuthError) {
    return reply.status(error.statusCode).send({ message: error.message });
  }
  throw error;
}

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = registerSchema.parse(request.body);
    const result = await createUser(body);
    return reply.status(201).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = loginSchema.parse(request.body);
    const result = await loginUser(body);
    return reply.status(200).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
}

/** Current logged-in user from JWT */
export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user!.id;
    const user = await getUserById(userId);
    return reply.status(200).send({ user });
  } catch (error) {
    return handleError(error, reply);
  }
}
