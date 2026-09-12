import type { UserRole } from "../../models/user.model.js";
import * as orderRepo from "../repository/order.repository.js";
import { toPublicOrder } from "./helpers.js";

/** List orders for current user (role-scoped) */
export async function listOrders(user: { id: string; role: UserRole }) {
  let filter = {};

  switch (user.role) {
    case "CUSTOMER":
      filter = { customerId: user.id };
      break;
    case "SELLER":
      filter = { sellerId: user.id };
      break;
    case "AGENT":
      filter = { agentId: user.id };
      break;
    case "SUPERADMIN":
      filter = {};
      break;
    default:
      filter = { _id: null };
  }

  const orders = await orderRepo.findAll(filter);
  return orders.map(toPublicOrder);
}
