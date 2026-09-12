import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const addressSchema = z.object({
  line1: z.string().trim().min(1),
  city: z.string().trim().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const upsertShopSchema = z.object({
  shopName: z.string().trim().min(2),
  description: z.string().trim().optional(),
  pickupAddress: addressSchema,
  isOpen: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  price: z.number().min(0),
  isAvailable: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  price: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

export const shopIdParamSchema = z.object({ id: objectId });
export const productIdParamSchema = z.object({ id: objectId });

export type UpsertShopInput = z.infer<typeof upsertShopSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
