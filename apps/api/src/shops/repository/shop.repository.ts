import type { FilterQuery } from "mongoose";
import {
  SellerProfile,
  type SellerProfileDocument,
} from "../../models/seller-profile.model.js";
import type { UpsertShopInput } from "../schema.js";

export type ShopFilter = FilterQuery<SellerProfileDocument>;

export function toPublicShop(shop: SellerProfileDocument) {
  return {
    id: shop._id.toString(),
    userId: shop.userId.toString(),
    shopName: shop.shopName,
    description: shop.description ?? undefined,
    pickupAddress: shop.pickupAddress,
    isOpen: shop.isOpen,
    createdAt: (shop as { createdAt?: Date }).createdAt,
  };
}

export async function findByUserId(userId: string) {
  return SellerProfile.findOne({ userId }).exec();
}

export async function findById(id: string) {
  return SellerProfile.findById(id).exec();
}

export async function findOpenShops(q?: string) {
  const filter: ShopFilter = { isOpen: true };
  if (q?.trim()) {
    filter.shopName = { $regex: q.trim(), $options: "i" };
  }
  return SellerProfile.find(filter).sort({ shopName: 1 }).exec();
}

export async function upsertByUserId(userId: string, data: UpsertShopInput) {
  return SellerProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        shopName: data.shopName,
        description: data.description,
        pickupAddress: data.pickupAddress,
        isOpen: data.isOpen ?? true,
        userId,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).exec();
}
