import mongoose, { Schema } from "mongoose";
import { ISavedPost } from "../../types/savedPost.types";

const schema: Schema<ISavedPost> = new Schema<ISavedPost>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "post",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ postId: 1, userId: 1 }, { unique: true });

const savedPostModel = mongoose.model("savedPost", schema);
export default savedPostModel;
