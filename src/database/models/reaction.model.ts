import mongoose, { Schema } from "mongoose";
import { IReaction, ReactionType } from "../../types/reaction.types";

const schema: Schema<IReaction> = new Schema<IReaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    modelId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "onModel",
    },
    onModel: {
      type: String,
      required: true,
      enum: ["post", "comment"],
    },
    reaction: {
      type: String,
      required: true,
      enum: Object.values(ReactionType),
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one reaction per post/comment
schema.index({ userId: 1, modelId: 1, onModel: 1 }, { unique: true });

const reactionModel = mongoose.model<IReaction>("reaction", schema);
export default reactionModel;
