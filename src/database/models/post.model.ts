import mongoose, { Schema } from "mongoose";
import { IPost } from "../../types/post.types";

const schema: Schema<IPost> = new Schema<IPost>(
  {
    caption: {
      type: String,
      trim: true,
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
    mentions: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        username: {
          type: String,
        },
      },
    ],
    media: {
      type: [String],
    },
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    location: {
      type: String,
      enum: ["profile", "group"],
      default: "profile",
    },
    groupID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
    },
    views: {
      type: Number,
      default: 0,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    reactionCounts: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

const postModel = mongoose.model("post", schema);
export default postModel;
