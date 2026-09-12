import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { ORDER_STATUSES } from "./order.model.js";

const orderStatusHistorySchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type OrderStatusHistoryDocument = InferSchemaType<
  typeof orderStatusHistorySchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const OrderStatusHistory = mongoose.model(
  "OrderStatusHistory",
  orderStatusHistorySchema
);
