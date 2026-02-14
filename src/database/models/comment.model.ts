import mongoose, { mongo, Schema } from "mongoose";
import { IComment } from "../../types/comment.types";

const schema: Schema<IComment> = new Schema<IComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    text: {
      type: String,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    reactionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
schema.index({ postId: 1, parentId: 1, reactionsCount: -1, _id: -1 });
const commentModel = mongoose.model<IComment>("comment", schema);
export default commentModel;
