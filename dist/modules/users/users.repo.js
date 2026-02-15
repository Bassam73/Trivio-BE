"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../../database/models/user.model"));
class UsersRepository {
    async getUserByID(id) {
        return await user_model_1.default.findById(id);
    }
    async incFollowing(userID, value) {
        return await user_model_1.default.findByIdAndUpdate(userID, {
            $inc: { following: value },
        }, { new: true });
    }
    async incFollowers(userID, value) {
        return await user_model_1.default.findByIdAndUpdate(userID, {
            $inc: { followers: value },
        }, { new: true });
    }
    async getLikedPostIds(userId, page, limit) {
        const user = await user_model_1.default.findById(userId)
            .select("likedPosts")
            .populate({
            path: "likedPosts",
            select: "post",
            options: {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { createdAt: -1 }
            },
        });
        if (!user || !user.likedPosts) {
            return [];
        }
        const postIds = user.likedPosts.map((like) => like.post);
        return postIds;
    }
    async updateProfile(userId, data) {
        return await user_model_1.default.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    }
    static getInstance() {
        if (!UsersRepository.instance) {
            UsersRepository.instance = new UsersRepository();
        }
        return UsersRepository.instance;
    }
}
exports.default = UsersRepository;
