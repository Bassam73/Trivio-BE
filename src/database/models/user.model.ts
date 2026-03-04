import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../../types/user.types";

const schema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    passwordChangedAt: {
      type: Date,
    },
    code: {
      type: Number,
      required: true,
    },
    codeCreatedAt: {
      type: Date,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    OTP: {
      type: Number,
    },
    OTPCreatedAt: {
      type: Date,
    },
    following: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
    },
    posts: {
      type: Number,
      default: 0,
    },
    privacy:{
      type : String ,
      enum: ['public' , 'private'],
      default : "public"
    },
    favTeams: {
      type: [String],
      default: [],
    },
    favPlayers: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: 300,
    },
    avatar: {
      type: String,
      // default: `${process.env.BASE_URL || "http://localhost:3500"}/uploads/avatars/default-avatar.png`,
    },
    
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password;
        delete ret.code;
        delete ret.codeCreatedAt;
        delete ret.OTP;
        delete ret.OTPCreatedAt;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

schema.virtual("likedPosts", {
  ref: "like",
  localField: "_id",
  foreignField: "user",
});

const userModel = mongoose.model("user", schema);
export default userModel;
