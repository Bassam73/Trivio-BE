"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../core/utils/AppError"));
const follow_types_1 = require("../../types/follow.types");
const follow_service_1 = __importDefault(require("../follow/follow.service"));
const posts_service_1 = __importDefault(require("../posts/posts.service"));
const users_repo_1 = __importDefault(require("./users.repo"));
class UsersService {
    constructor(repo, followService, postService) {
        this.repo = repo;
        this.followSerivce = followService;
        this.postService = postService;
    }
    async followUser(userID, followerID) {
        const user = await this.repo.getUserByID(userID);
        if (!user)
            throw new AppError_1.default("User you are trying to follow is not found", 404);
        const follow = await this.followSerivce.followUser(user.id, followerID, user.privacy);
        if (follow.status == follow_types_1.FollowStauts.following) {
            await this.repo.incFollowers(userID, 1);
            await this.repo.incFollowing(followerID, 1);
        }
        return follow;
    }
    async unFollowUser(userID, followerID) {
        const user = await this.repo.getUserByID(userID);
        if (!user)
            throw new AppError_1.default("User your trying to unfollow/cancel follow request is not found", 404);
        const followType = await this.followSerivce.unFollowUser(userID, followerID);
        if (followType == follow_types_1.FollowStauts.following) {
            await this.repo.incFollowers(userID, -1);
            await this.repo.incFollowing(followerID, -1);
        }
    }
    async getFollowers(userId, page, limit) {
        return await this.followSerivce.getFollowers(userId, page, limit);
    }
    async getFollowing(userId, page, limit) {
        return await this.followSerivce.getFollowing(userId, page, limit);
    }
    async getRelationshipStatus(targetUserId, currentUserId) {
        return await this.followSerivce.getRelationshipStatus(currentUserId, targetUserId);
    }
    async getMe(userId) {
        const user = await this.repo.getUserByID(userId);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        return user;
    }
    async getLikedPosts(userId, page, limit) {
        return await this.repo.getLikedPostIds(userId, page, limit);
    }
    async getBulkLikedPosts(postIds) {
        return await this.postService.getPostsByIds(postIds);
    }
    async getUserPosts(userId, page, limit) {
        return await this.postService.getUsersPosts(userId, page, limit);
    }
    async updateProfile(userId, data) {
        const allowedUpdates = ['favPlayers', 'favTeams', 'bio', 'avatar', 'username'];
        const safeData = {};
        if (data) {
            console.log(data);
            Object.keys(data).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    safeData[key] = data[key];
                }
            });
        }
        console.log(safeData);
        const updatedUser = await this.repo.updateProfile(userId, safeData);
        if (!updatedUser)
            throw new AppError_1.default("User not found", 404);
        return updatedUser;
    }
    static getInstance() {
        if (!UsersService.instance) {
            UsersService.instance = new UsersService(users_repo_1.default.getInstance(), follow_service_1.default.getInstance(), posts_service_1.default.getInstace());
        }
        return UsersService.instance;
    }
}
exports.default = UsersService;
