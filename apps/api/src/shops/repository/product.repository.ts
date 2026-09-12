import type { FilterQuery } from "mongoose";
import { Product, type ProductDocument } from "../../models/product.model.js";
import type { CreateProductInput, UpdateProductInput } from "../schema.js";

export type ProductFilter = FilterQuery<ProductDocument>;

export function toPublicProduct(product: ProductDocument) {
  return {
    id: product._id.toString(),
    sellerId: product.sellerId.toString(),
    name: product.name,
    description: product.description ?? undefined,
    price: product.price,
    isAvailable: product.isAvailable,
    createdAt: (product as { createdAt?: Date }).createdAt,
  };
}

export async function create(sellerId: string, data: CreateProductInput) {
  return Product.create({
    sellerId,
    name: data.name,
    description: data.description,
    price: data.price,
    isAvailable: data.isAvailable ?? true,
  });
}

export async function findById(id: string) {
  return Product.findById(id).exec();
}

export async function findByIds(ids: string[]) {
  return Product.find({ _id: { $in: ids } }).exec();
}

export async function findBySellerId(
  sellerId: string,
  options?: { availableOnly?: boolean }
) {
  const filter: ProductFilter = { sellerId };
  if (options?.availableOnly) {
    filter.isAvailable = true;
  }
  return Product.find(filter).sort({ name: 1 }).exec();
}

export async function searchByName(q: string) {
  return Product.find({
    isAvailable: true,
    name: { $regex: q.trim(), $options: "i" },
  })
    .sort({ name: 1 })
    .limit(50)
    .exec();
}

export async function updateById(
  id: string,
  sellerId: string,
  data: UpdateProductInput
) {
  return Product.findOneAndUpdate(
    { _id: id, sellerId },
    { $set: data },
    { new: true }
  ).exec();
}
