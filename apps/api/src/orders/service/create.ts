import * as userRepo from "../../auth/repository/user.repository.js";
import * as productRepo from "../../shops/repository/product.repository.js";
import * as shopRepo from "../../shops/repository/shop.repository.js";
import * as orderRepo from "../repository/order.repository.js";
import { OrderError } from "../errors.js";
import type { CreateOrderInput } from "../schema.js";
import { toPublicOrder } from "./helpers.js";

type ResolvedItem = {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
};

async function resolveItems(
  sellerId: string,
  items: CreateOrderInput["items"]
): Promise<ResolvedItem[]> {
  const productIds = items
    .map((i) => i.productId)
    .filter((id): id is string => Boolean(id));

  const products = productIds.length
    ? await productRepo.findByIds(productIds)
    : [];
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  return items.map((item) => {
    if (item.productId) {
      const product = byId.get(item.productId);
      if (!product || product.sellerId.toString() !== sellerId) {
        throw new OrderError(`Product not found for this shop: ${item.productId}`, 400);
      }
      if (!product.isAvailable) {
        throw new OrderError(`Product unavailable: ${product.name}`, 400);
      }
      return {
        productId: product._id.toString(),
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    }

    if (!item.name) {
      throw new OrderError("Item name required when productId is missing", 400);
    }

    return {
      name: item.name,
      quantity: item.quantity,
      price: item.price ?? 0,
    };
  });
}

/** CUSTOMER creates an order for a seller shop */
export async function createOrder(
  customerId: string,
  input: CreateOrderInput
) {
  const seller = await userRepo.findById(input.sellerId);
  if (!seller || seller.role !== "SELLER") {
    throw new OrderError("Seller not found", 404);
  }

  const shop = await shopRepo.findByUserId(input.sellerId);
  if (!shop || !shop.isOpen) {
    throw new OrderError("Shop is not open or not set up", 400);
  }

  const resolvedItems = await resolveItems(input.sellerId, input.items);
  const totalAmount = resolvedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const pickupAddress = input.pickupAddress ?? {
    line1: shop.pickupAddress.line1,
    city: shop.pickupAddress.city,
    ...(shop.pickupAddress.lat != null ? { lat: shop.pickupAddress.lat } : {}),
    ...(shop.pickupAddress.lng != null ? { lng: shop.pickupAddress.lng } : {}),
  };

  const order = await orderRepo.create({
    customerId,
    sellerId: input.sellerId,
    items: resolvedItems,
    pickupAddress,
    dropAddress: input.dropAddress,
    notes: input.notes,
    totalAmount,
  });

  await orderRepo.addStatusHistory({
    orderId: order._id.toString(),
    status: "PENDING",
    changedBy: customerId,
    note: "Order created",
  });

  return toPublicOrder(order);
}
