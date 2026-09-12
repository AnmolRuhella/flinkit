import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AuthError } from "../../auth/errors.js";
import { ShopError } from "../errors.js";
import {
  createProductSchema,
  productIdParamSchema,
  shopIdParamSchema,
  updateProductSchema,
  upsertShopSchema,
} from "../schema.js";
import * as productService from "../service/products.js";
import * as shopService from "../service/shops.js";

function handleError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  if (error instanceof ShopError || error instanceof AuthError) {
    return reply.status(error.statusCode).send({ message: error.message });
  }
  throw error;
}

export async function listShops(request: FastifyRequest, reply: FastifyReply) {
  try {
    const q = (request.query as { q?: string }).q;
    const shops = await shopService.listShops(q);
    return reply.send({ shops, count: shops.length });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getShop(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = shopIdParamSchema.parse(request.params);
    const shop = await shopService.getShopById(id);
    return reply.send({ shop });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getShopProducts(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = shopIdParamSchema.parse(request.params);
    const products = await productService.listShopProducts(id);
    return reply.send({ products, count: products.length });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getMyShop(request: FastifyRequest, reply: FastifyReply) {
  try {
    const shop = await shopService.getMyShop(request.user!.id);
    return reply.send({ shop });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function upsertMyShop(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = upsertShopSchema.parse(request.body);
    const shop = await shopService.upsertMyShop(request.user!.id, body);
    return reply.send({ shop });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function listMyProducts(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const products = await productService.listMyProducts(request.user!.id);
    return reply.send({ products, count: products.length });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createMyProduct(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = createProductSchema.parse(request.body);
    const product = await productService.createMyProduct(
      request.user!.id,
      body
    );
    return reply.status(201).send({ product });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateMyProduct(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = productIdParamSchema.parse(request.params);
    const body = updateProductSchema.parse(request.body);
    const product = await productService.updateMyProduct(
      request.user!.id,
      id,
      body
    );
    return reply.send({ product });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function searchProducts(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const q = (request.query as { q?: string }).q ?? "";
    const products = await productService.searchProducts(q);
    return reply.send({ products, count: products.length });
  } catch (error) {
    return handleError(error, reply);
  }
}
