"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const follow_model_1 = __importDefault(require("../../database/models/follow.model"));
const follow_types_1 = require("../../types/follow.types");
class FollowRepository {
    async createFollow(userID, followerID, status) {
        return await follow_model_1.default.create({
            userId: userID,
            follwerId: followerID,
            status,
        });
    }
    async getAFollow(userID, followerID) {
        return await follow_model_1.default.findOne({ userId: userID, follwerId: followerID });
    }
    async deleteFollowByID(followID) {
        await follow_model_1.default.findByIdAndDelete(followID);
    }
    async getFollowRequests(userID) {
        return await follow_model_1.default
            .find({
            userId: userID,
            status: follow_types_1.FollowStauts.pending,
        })
            .populate("follwerId");
    }
    async getFollowRequestById(requestId) {
        return await follow_model_1.default.findById(requestId);
    }
    async updateFollowStatus(followId, status) {
        return await follow_model_1.default.findByIdAndUpdate(followId, { status }, { new: true });
    }
    async deleteFollowRequest(requestId) {
        await follow_model_1.default.findByIdAndDelete(requestId);
    }
    async getFollowers(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await follow_model_1.default
            .find({ userId: userId, status: follow_types_1.FollowStauts.following })
            .populate("follwerId")
            .skip(skip)
            .limit(limit);
    }
    async getFollowing(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await follow_model_1.default
            .find({ follwerId: userId, status: follow_types_1.FollowStauts.following })
            .populate("userId")
            .skip(skip)
            .limit(limit);
    }
    static getInstance() {
        if (!FollowRepository.instance) {
            FollowRepository.instance = new FollowRepository();
        }
        return FollowRepository.instance;
    }
}
exports.default = FollowRepository;
