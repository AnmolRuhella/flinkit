import type { UserRole } from "../../models/user.model.js";
import * as orderRepo from "../repository/order.repository.js";
import { OrderError } from "../errors.js";
import { toPublicOrder } from "./helpers.js";

function canAccessOrder(
  order: {
    customerId: { toString(): string };
    sellerId: { toString(): string };
    agentId?: { toString(): string } | null;
  },
  user: { id: string; role: UserRole }
) {
  if (user.role === "SUPERADMIN") return true;
  if (user.role === "CUSTOMER" && order.customerId.toString() === user.id) {
    return true;
  }
  if (user.role === "SELLER" && order.sellerId.toString() === user.id) {
    return true;
  }
  if (
    user.role === "AGENT" &&
    order.agentId &&
    order.agentId.toString() === user.id
  ) {
    return true;
  }
  return false;
}

/** Get one order (must be related party or SUPERADMIN) */
export async function getOrderById(
  orderId: string,
  user: { id: string; role: UserRole }
) {
  const order = await orderRepo.findById(orderId);
  if (!order) {
    throw new OrderError("Order not found", 404);
  }
  if (!canAccessOrder(order, user)) {
    throw new OrderError("Forbidden", 403);
  }

  const history = await orderRepo.findHistoryByOrderId(orderId);

  return {
    order: toPublicOrder(order),
    history: history.map((h) => ({
      id: h._id.toString(),
      status: h.status,
      changedBy: h.changedBy.toString(),
      note: h.note ?? undefined,
      createdAt: (h as { createdAt?: Date }).createdAt,
    })),
  };
}
