import * as orderRepo from "../repository/order.repository.js";
import { toPublicOrder } from "./helpers.js";

/**
 * Orders waiting for a delivery agent (shop already accepted = CONFIRMED).
 * Agents poll this until push/Kafka notifications exist.
 */
export async function listAvailableOrders() {
  const orders = await orderRepo.findAll({
    status: "CONFIRMED",
    agentId: null,
  });
  return orders.map(toPublicOrder);
}
