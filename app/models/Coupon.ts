import { connectToDatabase } from "../../lib/db";
import { v4 as uuidv4 } from "uuid";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // Percentage (0-100) or fixed amount
  minPurchaseAmount?: number; // Minimum order total required
  maxDiscountAmount?: number; // Maximum discount for percentage coupons
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number; // Total number of times coupon can be used
  usageCount: number; // Current usage count
  userLimit?: number; // Number of times a single user can use this coupon
  active: boolean;
  applicableCategories?: string[]; // Product categories this coupon applies to
  applicableProducts?: string[]; // Specific product IDs this coupon applies to
  createdAt: Date;
  updatedAt: Date;
}

export async function getCoupons() {
  const { db } = await connectToDatabase();
  const couponsCollection = db.collection("coupons");

  return couponsCollection.find().sort({ createdAt: -1 }).toArray();
}

export async function getCoupon(id: string) {
  const { db } = await connectToDatabase();
  const couponsCollection = db.collection("coupons");

  return couponsCollection.findOne({ id });
}

export async function getCouponByCode(code: string) {
  const { db } = await connectToDatabase();
  const couponsCollection = db.collection("coupons");

  return couponsCollection.findOne({ code: code.toUpperCase() });
}

export async function createCoupon(
  couponData: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usageCount">
) {
  const { db } = await connectToDatabase();
  const couponsCollection = db.collection("coupons");

  const now = new Date();
  const newCoupon = {
    id: uuidv4(),
    ...couponData,
    code: couponData.code.toUpperCase(),
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await couponsCollection.insertOne(newCoupon);
  return newCoupon;
}

export async function updateCoupon(
  id: string,
  couponData: Partial<Omit<Coupon, "id" | "createdAt" | "updatedAt">>
) {
  const { db } = await connectToDatabase();
  const couponsCollection = db.collection("coupons");

  const updatedCoupon = {
    ...couponData,
    ...(couponData.code && { code: couponData.code.toUpperCase() }),
    updatedAt: new Date(),
  };

  await couponsCollection.updateOne({ id }, { $set: updatedCoupon });
  return { id, ...updatedCoupon };
}

export async function deleteCoupon(id: string) {
  const { db } = await connectToDatabase();
  const couponsCollection = db.collection("coupons");

  await couponsCollection.deleteOne({ id });
  return { id };
}

export async function incrementCouponUsage(id: string) {
  const { db } = await connectToDatabase();
  const couponsCollection = db.collection("coupons");

  await couponsCollection.updateOne(
    { id },
    {
      $inc: { usageCount: 1 },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function getUserCouponUsage(userId: string, couponId: string) {
  const { db } = await connectToDatabase();
  const couponUsageCollection = db.collection("couponUsage");

  const usage = await couponUsageCollection
    .find({
      userId,
      couponId,
    })
    .toArray();

  return usage.length;
}

export async function recordCouponUsage(
  userId: string,
  couponId: string,
  orderId: string
) {
  const { db } = await connectToDatabase();
  const couponUsageCollection = db.collection("couponUsage");

  const now = new Date();
  const usage = {
    id: uuidv4(),
    userId,
    couponId,
    orderId,
    createdAt: now,
  };

  await couponUsageCollection.insertOne(usage);
  return usage;
}
