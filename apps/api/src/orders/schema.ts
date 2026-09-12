import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

const addressSchema = z.object({
  line1: z.string().trim().min(1),
  city: z.string().trim().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const orderItemSchema = z
  .object({
    productId: objectId.optional(),
    name: z.string().trim().min(1).optional(),
    quantity: z.number().int().min(1),
    price: z.number().min(0).optional(),
  })
  .refine((item) => Boolean(item.productId || item.name), {
    message: "Each item needs productId or name",
  });

export const createOrderSchema = z.object({
  sellerId: objectId,
  items: z.array(orderItemSchema).min(1),
  pickupAddress: addressSchema.optional(),
  dropAddress: addressSchema,
  notes: z.string().trim().optional(),
});

/** ASSIGNED is not set via this — agents use POST /orders/:id/accept */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PICKED_UP",
    "DELIVERED",
    "CANCELLED",
  ]),
  note: z.string().trim().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
