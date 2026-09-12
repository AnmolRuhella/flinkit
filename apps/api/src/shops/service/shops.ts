import { ShopError } from "../errors.js";
import type { UpsertShopInput } from "../schema.js";
import * as shopRepo from "../repository/shop.repository.js";

export async function listShops(q?: string) {
  const shops = await shopRepo.findOpenShops(q);
  return shops.map(shopRepo.toPublicShop);
}

export async function getShopById(id: string) {
  const shop = await shopRepo.findById(id);
  if (!shop) throw new ShopError("Shop not found", 404);
  return shopRepo.toPublicShop(shop);
}

export async function getMyShop(userId: string) {
  const shop = await shopRepo.findByUserId(userId);
  if (!shop) throw new ShopError("Shop profile not set up yet", 404);
  return shopRepo.toPublicShop(shop);
}

export async function upsertMyShop(userId: string, input: UpsertShopInput) {
  const shop = await shopRepo.upsertByUserId(userId, input);
  if (!shop) throw new ShopError("Failed to save shop", 500);
  return shopRepo.toPublicShop(shop);
}
