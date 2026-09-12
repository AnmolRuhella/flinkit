import * as orderRepo from "../repository/order.repository.js";
import { OrderError } from "../errors.js";
import { toPublicOrder } from "./helpers.js";

/**
 * Delivery agent claims a CONFIRMED order (Blinkit-style).
 * Atomic: only one agent wins if many accept at once.
 */
export async function acceptOrder(orderId: string, agentId: string) {
  const updated = await orderRepo.updateStatus({
    orderId,
    fromStatuses: ["CONFIRMED"],
    toStatus: "ASSIGNED",
    agentId,
  });

  if (!updated) {
    const existing = await orderRepo.findById(orderId);
    if (!existing) {
      throw new OrderError("Order not found", 404);
    }
    if (existing.status !== "CONFIRMED") {
      throw new OrderError(
        `Order is ${existing.status}, not available to accept`,
        409
      );
    }
    throw new OrderError("Order already taken by another agent", 409);
  }

  await orderRepo.addStatusHistory({
    orderId,
    status: "ASSIGNED",
    changedBy: agentId,
    note: "Agent accepted order",
  });

  return toPublicOrder(updated);
}
