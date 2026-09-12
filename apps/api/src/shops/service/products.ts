import { ShopError } from "../errors.js";
import type { CreateProductInput, UpdateProductInput } from "../schema.js";
import * as productRepo from "../repository/product.repository.js";
import * as shopRepo from "../repository/shop.repository.js";

export async function listShopProducts(shopId: string) {
  const shop = await shopRepo.findById(shopId);
  if (!shop) throw new ShopError("Shop not found", 404);

  const products = await productRepo.findBySellerId(shop.userId.toString(), {
    availableOnly: true,
  });
  return products.map(productRepo.toPublicProduct);
}

export async function listMyProducts(sellerId: string) {
  const products = await productRepo.findBySellerId(sellerId);
  return products.map(productRepo.toPublicProduct);
}

export async function createMyProduct(
  sellerId: string,
  input: CreateProductInput
) {
  const shop = await shopRepo.findByUserId(sellerId);
  if (!shop) {
    throw new ShopError("Set up your shop profile before adding products", 400);
  }

  const product = await productRepo.create(sellerId, input);
  return productRepo.toPublicProduct(product);
}

export async function updateMyProduct(
  sellerId: string,
  productId: string,
  input: UpdateProductInput
) {
  const product = await productRepo.updateById(productId, sellerId, input);
  if (!product) throw new ShopError("Product not found", 404);
  return productRepo.toPublicProduct(product);
}

export async function searchProducts(q: string) {
  if (!q.trim()) {
    return [];
  }

  const products = await productRepo.searchByName(q);
  const sellerIds = [...new Set(products.map((p) => p.sellerId.toString()))];
  const shops = await Promise.all(
    sellerIds.map(async (sellerId) => {
      const shop = await shopRepo.findByUserId(sellerId);
      return shop ? { sellerId, shop: shopRepo.toPublicShop(shop) } : null;
    })
  );
  const shopBySeller = new Map(
    shops.filter(Boolean).map((s) => [s!.sellerId, s!.shop])
  );

  return products
    .map((product) => {
      const shop = shopBySeller.get(product.sellerId.toString());
      if (!shop || !shop.isOpen) return null;
      return {
        ...productRepo.toPublicProduct(product),
        shopId: shop.id,
        shopName: shop.shopName,
      };
    })
    .filter(Boolean);
}
