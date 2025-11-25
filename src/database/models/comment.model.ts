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
});

const commentModel = new mongoose.Model("like", schema);
export default commentModel;
