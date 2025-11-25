import mongoose, { mongo, Schema } from "mongoose";
import { ILike } from "../../types/like.types";

const schema: Schema<ILike> = new Schema<ILike>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "post",
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: "comment",
  },
  react_type: {
    type: String,
    required: true,
    enum: ["like", "love", "haha", "wow", "sad", "angry"], // temp
  },
});

const likeModel = new mongoose.Model("like", schema);
export default likeModel;
