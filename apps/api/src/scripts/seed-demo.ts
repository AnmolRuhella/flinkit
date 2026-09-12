/**
 * Full demo seed — users, shop, products, sample orders.
 *
 * Usage:
 *   cd apps/api
 *   npm run seed:demo
 *
 * Demo logins (password for all: Demo@12345)
 *   customer@flinkit.demo  CUSTOMER
 *   seller@flinkit.demo    SELLER
 *   agent@flinkit.demo     AGENT
 *   admin@flinkit.com      SUPERADMIN
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { connectDb, disconnectDb } from "../lib/db.js";
import * as userRepo from "../auth/repository/user.repository.js";
import type { UserRole } from "../models/user.model.js";
import { SellerProfile } from "../models/seller-profile.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { OrderStatusHistory } from "../models/order-status-history.model.js";

const DEMO_PASSWORD = "Demo@12345";

type DemoUser = {
  name: string;
  email: string;
  role: UserRole;
};

const DEMO_USERS: DemoUser[] = [
  { name: "Demo Customer", email: "customer@flinkit.demo", role: "CUSTOMER" },
  { name: "Demo Seller", email: "seller@flinkit.demo", role: "SELLER" },
  { name: "Demo Agent", email: "agent@flinkit.demo", role: "AGENT" },
  { name: "Flinkit Admin", email: "admin@flinkit.com", role: "SUPERADMIN" },
];

async function ensureUser(demo: DemoUser, passwordHash: string) {
  const existing = await userRepo.findOne({ email: demo.email });
  if (existing) {
    if (existing.role !== demo.role) {
      throw new Error(
        `Email ${demo.email} exists with role ${existing.role}, expected ${demo.role}`
      );
    }
    console.log(`[seed:demo] user ok  ${demo.role.padEnd(11)} ${demo.email}`);
    return existing;
  }

  const user = await userRepo.create({
    name: demo.name,
    email: demo.email,
    passwordHash,
    role: demo.role,
    phone: "9999999999",
  });
  console.log(`[seed:demo] user +   ${demo.role.padEnd(11)} ${demo.email}`);
  return user;
}

async function seedDemo() {
  await connectDb();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users = {
    customer: await ensureUser(DEMO_USERS[0], passwordHash),
    seller: await ensureUser(DEMO_USERS[1], passwordHash),
    agent: await ensureUser(DEMO_USERS[2], passwordHash),
    admin: await ensureUser(DEMO_USERS[3], passwordHash),
  };

  const sellerId = users.seller._id;

  let shop = await SellerProfile.findOne({ userId: sellerId });
  if (!shop) {
    shop = await SellerProfile.create({
      userId: sellerId,
      shopName: "Fresh Mart Baner",
      description: "Groceries, dairy & daily essentials",
      isOpen: true,
      pickupAddress: {
        line1: "Shop 12, Baner Road",
        city: "Pune",
      },
    });
    console.log(`[seed:demo] shop +   ${shop.shopName}`);
  } else {
    console.log(`[seed:demo] shop ok  ${shop.shopName}`);
  }

  const catalog = [
    { name: "Amul Milk 1L", description: "Toned milk", price: 58 },
    { name: "Brown Bread", description: "Whole wheat", price: 45 },
    { name: "Farm Eggs (6)", description: "Tray of 6", price: 72 },
    { name: "Banana 1 dozen", description: "Fresh", price: 60 },
    { name: "Tomato 1kg", description: "Local", price: 40 },
  ];

  const products = [];
  for (const item of catalog) {
    let product = await Product.findOne({ sellerId, name: item.name });
    if (!product) {
      product = await Product.create({
        sellerId,
        ...item,
        isAvailable: true,
      });
      console.log(`[seed:demo] product + ${item.name}`);
    } else {
      console.log(`[seed:demo] product ok ${item.name}`);
    }
    products.push(product);
  }

  // Clean previous demo orders tagged in notes so re-seed is predictable
  const demoOrders = await Order.find({
    notes: { $regex: /^\[demo\]/ },
  });
  for (const o of demoOrders) {
    await OrderStatusHistory.deleteMany({ orderId: o._id });
    await o.deleteOne();
  }
  if (demoOrders.length) {
    console.log(`[seed:demo] cleared ${demoOrders.length} old demo order(s)`);
  }

  const milk = products[0];
  const bread = products[1];
  const eggs = products[2];

  const pending = await Order.create({
    customerId: users.customer._id,
    sellerId,
    agentId: null,
    items: [
      {
        productId: milk._id,
        name: milk.name,
        quantity: 2,
        price: milk.price,
      },
      {
        productId: bread._id,
        name: bread.name,
        quantity: 1,
        price: bread.price,
      },
    ],
    pickupAddress: shop.pickupAddress,
    dropAddress: {
      line1: "Flat 4B, Blue Ridge",
      city: "Pune",
    },
    status: "PENDING",
    totalAmount: milk.price * 2 + bread.price,
    notes: "[demo] Waiting for shop to accept",
  });
  await OrderStatusHistory.create({
    orderId: pending._id,
    status: "PENDING",
    changedBy: users.customer._id,
    note: "Demo order created",
  });
  console.log(`[seed:demo] order +  PENDING   ${pending._id.toString()}`);

  const confirmed = await Order.create({
    customerId: users.customer._id,
    sellerId,
    agentId: null,
    items: [
      {
        productId: eggs._id,
        name: eggs.name,
        quantity: 1,
        price: eggs.price,
      },
    ],
    pickupAddress: shop.pickupAddress,
    dropAddress: {
      line1: "Office 201, Tech Park",
      city: "Pune",
    },
    status: "CONFIRMED",
    totalAmount: eggs.price,
    notes: "[demo] Ready for delivery agent",
  });
  await OrderStatusHistory.create([
    {
      orderId: confirmed._id,
      status: "PENDING",
      changedBy: users.customer._id,
      note: "Demo order created",
    },
    {
      orderId: confirmed._id,
      status: "CONFIRMED",
      changedBy: users.seller._id,
      note: "Shop accepted (demo)",
    },
  ]);
  console.log(`[seed:demo] order +  CONFIRMED ${confirmed._id.toString()}`);

  console.log("\n========== DEMO READY ==========");
  console.log(`Password (all): ${DEMO_PASSWORD}`);
  console.log("customer@flinkit.demo  → browse shop / place orders");
  console.log("seller@flinkit.demo    → accept PENDING demo order");
  console.log("agent@flinkit.demo     → see CONFIRMED job in Available");
  console.log("admin@flinkit.com      → /admin");
  console.log("Shop: Fresh Mart Baner (open + 5 products)");
  console.log("================================\n");

  await disconnectDb();
}

seedDemo().catch(async (err) => {
  console.error("[seed:demo] Failed:", err);
  try {
    await disconnectDb();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
