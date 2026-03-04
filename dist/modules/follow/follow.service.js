"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../core/utils/AppError"));
const follow_types_1 = require("../../types/follow.types");
const user_types_1 = require("../../types/user.types");
const follow_repo_1 = __importDefault(require("./follow.repo"));
const users_repo_1 = __importDefault(require("../users/users.repo"));
class FollowService {
    constructor(repo, userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }
    async followUser(userID, follower, userStatus) {
        const checkFollow = await this.repo.getAFollow(userID, follower);
        if (checkFollow)
            throw new AppError_1.default("You already following/requested to follow this user", 409);
        let follow;
        let status;
        status =
            userStatus == user_types_1.UserPrivacy.private
                ? follow_types_1.FollowStauts.pending
                : follow_types_1.FollowStauts.following;
        follow = await this.repo.createFollow(userID, follower, status);
        if (!follow)
            throw new AppError_1.default("Error While creating follow", 500);
        return follow;
    }
    async unFollowUser(userID, followerID) {
        const follow = await this.repo.getAFollow(userID, followerID);
        if (!follow)
            throw new AppError_1.default("You are not following/requested to follow this user", 409);
        await this.repo.deleteFollowByID(follow._id);
        return follow.status;
    }
    async getFollowRequests(userID, privacy) {
        console.log(userID);
        if (privacy == user_types_1.UserPrivacy.public)
            throw new AppError_1.default("Your Account type is public you dont have follow requests", 409);
        const followRequests = await this.repo.getFollowRequests(userID);
        console.log(followRequests);
        if (followRequests.length <= 0)
            throw new AppError_1.default("No follow requests found for this account", 404);
        return followRequests;
    }
    async acceptFollowRequest(requestId, currentUserId) {
        const request = await this.repo.getFollowRequestById(requestId);
        if (!request) {
            throw new AppError_1.default("Follow request not found", 404);
        }
        if (request.userId.toString() !== currentUserId.toString()) {
            throw new AppError_1.default("You are not authorized to accept this request", 403);
        }
        if (request.status === follow_types_1.FollowStauts.following) {
            throw new AppError_1.default("Request already accepted", 400);
        }
        const updatedFollow = await this.repo.updateFollowStatus(requestId, follow_types_1.FollowStauts.following);
        if (!updatedFollow) {
            throw new AppError_1.default("Failed to update follow status", 500);
        }
        // Update counters
        // request.userId is the one who was requested (Target User) -> Followers + 1
        // request.follwerId is the one who requested (Follower) -> Following + 1
        await this.userRepo.incFollowers(request.userId.toString(), 1);
        await this.userRepo.incFollowing(request.follwerId.toString(), 1);
        return updatedFollow;
    }
    async declineFollowRequest(requestId, currentUserId) {
        const request = await this.repo.getFollowRequestById(requestId);
        if (!request) {
            throw new AppError_1.default("Follow request not found", 404);
        }
        if (request.userId.toString() !== currentUserId.toString()) {
            throw new AppError_1.default("You are not authorized to decline this request", 403);
        }
        await this.repo.deleteFollowRequest(requestId);
    }
    async getFollowers(userId, page, limit) {
        return await this.repo.getFollowers(userId, page, limit);
    }
    async getFollowing(userId, page, limit) {
        return await this.repo.getFollowing(userId, page, limit);
    }
    async getRelationshipStatus(currentUserId, targetUserId) {
        if (currentUserId.toString() === targetUserId.toString()) {
            return "self";
        }
        const follow = await this.repo.getAFollow(targetUserId, currentUserId);
        if (!follow) {
            return "none";
        }
        return follow.status;
    }
    static getInstance() {
        if (!FollowService.instance) {
            FollowService.instance = new FollowService(follow_repo_1.default.getInstance(), users_repo_1.default.getInstance());
        }
        return FollowService.instance;
    }
}
exports.default = FollowService;
