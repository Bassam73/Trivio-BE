import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../../types/user.types";
import { maxHeaderSize } from "http";
import { boolean, number, required } from "joi";

const schema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxHeaderSize: 20,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    passwordChangedAt: {
      type: Date,
    },
    code: {
      type: Number,
      minLength: 6,
      maxLength: 6,
      required: true,
    },
    codeCreatedAt: {
      type: Date,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    OTP: {
      type: Number,
    },
    OTPCreatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.code;
        delete ret.codeCreatedAt;
        delete ret.OTP;
        delete ret.OTPCreatedAt;
        return ret;
      },
    },
  }
);

const userModel = mongoose.model("user", schema);
export default userModel;
