import mongoose, { Model, Schema } from "mongoose";
import { FollowStauts, IFollow } from "../../types/follow.types";

const schema: Schema<IFollow> = new Schema<IFollow>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    follwerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    status: {
      type: String,
      enum: FollowStauts,
    },
  },
  {
    timestamps: true,
  },
);
schema.index({ userId: 1, follwerId: 1 });
const followModel = mongoose.model<IFollow>("follow", schema);
export default followModel;
