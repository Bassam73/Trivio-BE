import { Model, Schema } from "mongoose";
import { IFollow } from "../../types/follow.types";

const schema: Schema<IFollow> = new Schema<IFollow>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  followingId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
});

const followModel = new Model("follow", schema);
export default followModel;
