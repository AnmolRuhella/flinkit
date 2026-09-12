import mongoose, { Schema, type InferSchemaType } from "mongoose";

const addressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const sellerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    shopName: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    pickupAddress: { type: addressSchema, required: true },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type SellerProfileDocument = InferSchemaType<typeof sellerProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SellerProfile = mongoose.model("SellerProfile", sellerProfileSchema);
