import type { UserRole } from "../../models/user.model.js";
import type { OrderStatus } from "../../models/order.model.js";
import * as orderRepo from "../repository/order.repository.js";
import { OrderError } from "../errors.js";
import type { UpdateOrderStatusInput } from "../schema.js";
import { toPublicOrder } from "./helpers.js";

type Actor = { id: string; role: UserRole };

/**
 * Blinkit-style status updates (ASSIGNED is via agent accept, not here).
 * Customer order → Seller confirm → Agent accept → pickup → deliver
 */
const ALLOWED: Record<
  OrderStatus,
  { from: OrderStatus[]; roles: UserRole[] }
> = {
  PENDING: { from: [], roles: [] },
  CONFIRMED: { from: ["PENDING"], roles: ["SELLER"] },
  ASSIGNED: { from: [], roles: [] }, // use POST /orders/:id/accept
  PICKED_UP: { from: ["ASSIGNED"], roles: ["AGENT"] },
  DELIVERED: { from: ["PICKED_UP"], roles: ["AGENT"] },
  CANCELLED: {
    from: ["PENDING", "CONFIRMED"],
    roles: ["CUSTOMER", "SELLER", "SUPERADMIN"],
  },
};

/** Update order status with role + ownership checks */
export async function updateOrderStatus(
  orderId: string,
  actor: Actor,
  input: UpdateOrderStatusInput
) {
  const order = await orderRepo.findById(orderId);
  if (!order) {
    throw new OrderError("Order not found", 404);
  }

  const rule = ALLOWED[input.status];
  if (!rule || rule.from.length === 0) {
    throw new OrderError(`Cannot set status to ${input.status}`, 400);
  }

  if (!rule.roles.includes(actor.role)) {
    throw new OrderError(
      `Role ${actor.role} cannot set status to ${input.status}`,
      403
    );
  }

  if (actor.role === "CUSTOMER" && order.customerId.toString() !== actor.id) {
    throw new OrderError("Forbidden", 403);
  }
  if (actor.role === "SELLER" && order.sellerId.toString() !== actor.id) {
    throw new OrderError("Forbidden", 403);
  }
  if (actor.role === "AGENT") {
    if (!order.agentId || order.agentId.toString() !== actor.id) {
      throw new OrderError("Forbidden — not your assigned order", 403);
    }
  }

  if (!rule.from.includes(order.status as OrderStatus)) {
    throw new OrderError(
      `Cannot change from ${order.status} to ${input.status}`,
      400
    );
  }

  const updated = await orderRepo.updateStatus({
    orderId,
    fromStatuses: rule.from,
    toStatus: input.status,
  });

  if (!updated) {
    throw new OrderError("Order status was already changed", 409);
  }

  await orderRepo.addStatusHistory({
    orderId,
    status: input.status,
    changedBy: actor.id,
    note: input.note,
  });

  return toPublicOrder(updated);
}
