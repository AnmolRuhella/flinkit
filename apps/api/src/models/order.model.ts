import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const addressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v: unknown[]) => v.length > 0, "At least one item required"],
    },
    notes: { type: String, trim: true },
    pickupAddress: { type: addressSchema, required: true },
    dropAddress: { type: addressSchema, required: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PENDING",
      required: true,
      index: true,
    },
    totalAmount: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Order = mongoose.model("Order", orderSchema);
