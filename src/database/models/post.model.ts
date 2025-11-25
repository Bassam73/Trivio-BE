import mongoose, { Schema } from "mongoose";
import { IPost } from "../../types/post.types";

const schema: Schema<IPost> = new Schema<IPost>({
  caption: {
    type: String,
    required: true,
  },
  authorID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  type: {
    type: String,
    required: true,
    enum: ["public", "private"],
  },
  mentions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
  },
  media: {
    type: [String],
  },
  sharedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  },
  location: {
    type: String,
    required: true,
    enum: ["profile", "group"],
  },
  groupID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "group",
  },
  views: {
    type: Number,
    default: 0,
  },
});

const postModel = new mongoose.Model("post", schema);
export default postModel;
