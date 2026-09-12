import * as orderRepo from "../repository/order.repository.js";
import { OrderError } from "../errors.js";
import { toPublicOrder } from "./helpers.js";

/** Shop (seller) accepts a pending order */
export async function confirmOrder(orderId: string, sellerId: string) {
  const order = await orderRepo.findById(orderId);
  if (!order) {
    throw new OrderError("Order not found", 404);
  }
  if (order.sellerId.toString() !== sellerId) {
    throw new OrderError("Forbidden", 403);
  }

  const updated = await orderRepo.updateStatus({
    orderId,
    fromStatuses: ["PENDING"],
    toStatus: "CONFIRMED",
  });

  if (!updated) {
    throw new OrderError("Order is not pending or already confirmed", 409);
  }

  await orderRepo.addStatusHistory({
    orderId,
    status: "CONFIRMED",
    changedBy: sellerId,
    note: "Shop accepted order",
  });

  return toPublicOrder(updated);
}
