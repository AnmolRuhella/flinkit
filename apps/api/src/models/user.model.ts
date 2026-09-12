import mongoose, { Schema, type InferSchemaType } from "mongoose";

/** Roles allowed via public register */
export const PUBLIC_ROLES = ["CUSTOMER", "SELLER", "AGENT"] as const;
export type PublicRole = (typeof PUBLIC_ROLES)[number];

/** All roles in the system */
export const USER_ROLES = [...PUBLIC_ROLES, "SUPERADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User = mongoose.model("User", userSchema);
