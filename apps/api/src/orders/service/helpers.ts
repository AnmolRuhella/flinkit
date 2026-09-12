import type { OrderDocument } from "../../models/order.model.js";

export function toPublicOrder(order: OrderDocument) {
  return {
    id: order._id.toString(),
    customerId: order.customerId.toString(),
    sellerId: order.sellerId.toString(),
    agentId: order.agentId ? order.agentId.toString() : null,
    items: order.items,
    notes: order.notes ?? undefined,
    pickupAddress: order.pickupAddress,
    dropAddress: order.dropAddress,
    status: order.status,
    totalAmount: order.totalAmount ?? undefined,
    createdAt: (order as { createdAt?: Date }).createdAt,
    updatedAt: (order as { updatedAt?: Date }).updatedAt,
  };
}
