import mongoose, { Schema } from "mongoose";
import { IGroup } from "../../types/group.types";

const schema: Schema<IGroup> = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    privacy: {
      type: String,
      required: true,
      enum: ["public", "private"],
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    members: {
      type: Number,
      default: 0,
    },
    admins: {
      type: Number,
      default: 0,
    },
    moderators: {
      type: Number,
      default: 0,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    tags: {
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

const groupModel = mongoose.model("group", schema);
export default groupModel;
