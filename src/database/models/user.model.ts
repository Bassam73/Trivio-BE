import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../../types/user.types";
import { maxHeaderSize } from "http";
import { number } from "joi";

const schema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxHeaderSize: 20,
      unique: true,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.code;
        delete ret.codeCreatedAt;
        return ret;
      },
    },
  }
);

const userModel = mongoose.model("user", schema);
export default userModel;
