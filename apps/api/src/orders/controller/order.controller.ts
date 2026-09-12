import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AuthError } from "../../auth/errors.js";
import { OrderError } from "../errors.js";
import { createOrderSchema, updateOrderStatusSchema } from "../schema.js";
import { acceptOrder } from "../service/accept.js";
import { confirmOrder } from "../service/confirm.js";
import { createOrder } from "../service/create.js";
import { getOrderById } from "../service/get.js";
import { listOrders } from "../service/getAll.js";
import { listAvailableOrders } from "../service/listAvailable.js";
import { updateOrderStatus } from "../service/updateStatus.js";

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
  if (error instanceof OrderError || error instanceof AuthError) {
    return reply.status(error.statusCode).send({ message: error.message });
  }
  throw error;
}

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = createOrderSchema.parse(request.body);
    const order = await createOrder(request.user!.id, body);
    return reply.status(201).send({ order });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function list(request: FastifyRequest, reply: FastifyReply) {
  try {
    const orders = await listOrders(request.user!);
    return reply.status(200).send({ orders, count: orders.length });
  } catch (error) {
    return handleError(error, reply);
  }
}

/** Agent: open orders after shop accepted */
export async function listAvailable(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const orders = await listAvailableOrders();
    return reply.status(200).send({ orders, count: orders.length });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getOne(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const result = await getOrderById(id, request.user!);
    return reply.status(200).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
}

/** Shop accepts order */
export async function confirm(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const order = await confirmOrder(id, request.user!.id);
    return reply.status(200).send({ order });
  } catch (error) {
    return handleError(error, reply);
  }
}

/** Delivery agent claims order */
export async function accept(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const order = await acceptOrder(id, request.user!.id);
    return reply.status(200).send({ order });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateStatus(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const body = updateOrderStatusSchema.parse(request.body);
    const order = await updateOrderStatus(id, request.user!, body);
    return reply.status(200).send({ order });
  } catch (error) {
    return handleError(error, reply);
  }
}
