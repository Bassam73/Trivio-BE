import mongoose, { Schema } from "mongoose";
import { ILike } from "../../types/like.types";

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },

    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },

    react_type: {
      type: String,
      required: true,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
    },
  },
  { timestamps: true }
);

likeSchema.index(
  { user: 1, postId: 1 },
  {
    unique: true,
    partialFilterExpression: { postId: { $exists: true } },
  }
);

likeSchema.index(
  { user: 1, commentId: 1 },
  {
    unique: true,
    partialFilterExpression: { commentId: { $exists: true } },
  }
);

const likeModel = mongoose.model("Like", likeSchema);
export default likeModel;
