import mongoose, { mongo, Schema } from "mongoose";
import { IComment } from "../../types/comment.types";

const schema: Schema<IComment> = new Schema<IComment>({
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
  media: {
    type: String,
  },
  text: {
    type: String,
  },
  reactionCounts: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    haha: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
});

const commentModel = new mongoose.Model("like", schema);
export default commentModel;
