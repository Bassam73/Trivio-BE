import { Model, Schema } from "mongoose";
import { IMember } from "../../types/member.types";

const schema: Schema<IMember> = new Schema<IMember>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  groupId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "group",
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "member"],
  },
});

const memberModel = new Model("member", schema);
export default memberModel;
