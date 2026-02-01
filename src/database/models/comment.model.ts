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
    media: {
      type: String,
    },
    text: {
      type: String,
    },
    isDeleted : {
      type : Boolean,
      default :false
    },
    isEdited : {
      type : Boolean,
      default : false
    }
  },
  {
    timestamps: true,
  },
);
schema.index({ postId: 1, parent: 1, createdAt: -1 });
schema.index({ parent: 1, createdAt: 1 });
const commentModel = mongoose.model<IComment>("comment", schema);
export default commentModel;
