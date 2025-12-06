import mongoose, { Schema } from "mongoose";
import { IGroup, IGroupMember, IJoinRequest } from "../../types/group.types";

const schema: Schema<IJoinRequest> = new Schema<IJoinRequest>(
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
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected"],
    },
    
  },
  {
    timestamps: true,
  }
);

const joinRequestModel =  mongoose.model("joinRequest", schema);
export default joinRequestModel;
