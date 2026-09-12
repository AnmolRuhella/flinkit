import type { FilterQuery } from "mongoose";
import { Order, type OrderDocument, type OrderStatus } from "../../models/order.model.js";
import { OrderStatusHistory } from "../../models/order-status-history.model.js";
import mongoose from "mongoose";

export type OrderFilter = FilterQuery<OrderDocument>;

export type CreateOrderData = {
  customerId: string;
  sellerId: string;
  items: {
    productId?: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  pickupAddress: {
    line1: string;
    city: string;
    lat?: number;
    lng?: number;
  };
  dropAddress: {
    line1: string;
    city: string;
    lat?: number;
    lng?: number;
  };
  notes?: string;
  totalAmount?: number;
};

export async function create(data: CreateOrderData) {
  return Order.create({
    customerId: data.customerId,
    sellerId: data.sellerId,
    agentId: null,
    items: data.items,
    pickupAddress: data.pickupAddress,
    dropAddress: data.dropAddress,
    notes: data.notes,
    status: "PENDING",
    totalAmount: data.totalAmount,
  });
}

export async function findById(id: string) {
  return Order.findById(id).exec();
}

export async function findAll(filter: OrderFilter = {}) {
  return Order.find(filter).sort({ createdAt: -1 }).exec();
}

export async function updateStatus(params: {
  orderId: string;
  fromStatuses: OrderStatus[];
  toStatus: OrderStatus;
  agentId?: string | null;
}) {
  const update: Record<string, unknown> = { status: params.toStatus };
  if (params.agentId !== undefined) {
    update.agentId = params.agentId;
  }

  return Order.findOneAndUpdate(
    {
      _id: params.orderId,
      status: { $in: params.fromStatuses },
    },
    { $set: update },
    { new: true }
  ).exec();
}

export async function addStatusHistory(params: {
  orderId: string;
  status: OrderStatus;
  changedBy: string;
  note?: string;
}) {
  return OrderStatusHistory.create({
    orderId: new mongoose.Types.ObjectId(params.orderId),
    status: params.status,
    changedBy: new mongoose.Types.ObjectId(params.changedBy),
    note: params.note,
  });
}

export async function findHistoryByOrderId(orderId: string) {
  return OrderStatusHistory.find({ orderId })
    .sort({ createdAt: 1 })
    .exec();
}
