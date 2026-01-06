import mongoose, { Schema } from "mongoose";
import { IGroup, IGroupMember } from "../../types/group.types";

const schema: Schema<IGroupMember> = new Schema<IGroupMember>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "group",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "moderator", "member"],
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "banned"],
    },
    kicksCount: {
      type: Number,
      default: 0,
    },
    lastKickReset: {
      type: Date,
      default: Date.now,
    },
    
  },
  {
    timestamps: true,
  }
);

schema.index({ groupId: 1, userId: 1 }, { unique: true });


const groupMemberModel =  mongoose.model("groupMember", schema);
export default groupMemberModel;
