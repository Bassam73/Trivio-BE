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
const bcrypt_1 = __importDefault(require("bcrypt"));
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
    // update existing user data and it is also the way for the user to add fav teams , players and avatar
    async updateProfile(userId, data) {
        const currentUser = await this.repo.getUserByID(userId);
        if (!currentUser)
            throw new AppError_1.default("User not found", 404);
        const allowedUpdates = ['favPlayers', 'favTeams', 'bio', 'avatar', 'username'];
        const updateOp = {};
        if (data) {
            console.log(data);
            Object.keys(data).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    let value = data[key];
                    if ((key === 'favTeams' || key === 'favPlayers') && typeof data[key] === 'string') {
                        try {
                            value = JSON.parse(data[key]);
                        }
                        catch (error) {
                            value = data[key];
                        }
                    }
                    if (key === 'username' && value === currentUser.username) {
                        return;
                    }
                    if (key === 'favTeams' || key === 'favPlayers') {
                        if (!updateOp.$addToSet)
                            updateOp.$addToSet = {};
                        updateOp.$addToSet[key] = { $each: Array.isArray(value) ? value : [value] };
                    }
                    else {
                        if (!updateOp.$set)
                            updateOp.$set = {};
                        updateOp.$set[key] = value;
                    }
                }
            });
        }
        if (Object.keys(updateOp).length === 0)
            return currentUser;
        console.log(updateOp);
        const updatedUser = await this.repo.updateProfile(userId, updateOp);
        if (!updatedUser)
            throw new AppError_1.default("User not found", 404);
        return updatedUser;
    }
    async getFavTeams(userId) {
        const user = await this.repo.getUserByID(userId);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        return user.favTeams;
    }
    async getFavPlayers(userId) {
        const user = await this.repo.getUserByID(userId);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        return user.favPlayers;
    }
    async removeTeam(userId, teamsToRemove) {
        const user = await this.repo.getUserByID(userId);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        const updatedUser = await this.repo.removeTeam(userId, teamsToRemove);
        if (!updatedUser)
            throw new AppError_1.default("User not found", 404);
        return updatedUser;
    }
    async removePlayer(userId, playersToRemove) {
        const user = await this.repo.getUserByID(userId);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        const updatedUser = await this.repo.removePlayer(userId, playersToRemove);
        if (!updatedUser)
            throw new AppError_1.default("Error updating user", 400);
        return updatedUser;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.repo.getUserByID(userId);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        if (!user.isVerified)
            throw new AppError_1.default("User is not verified", 400);
        if (!user.password)
            throw new AppError_1.default("User does not have a password set", 400);
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            throw new AppError_1.default("Invalid current password", 400);
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, parseInt(process.env.SALT_ROUNDS));
        await this.repo.changePassword(userId, hashedNewPassword);
    }
    static getInstance() {
        if (!UsersService.instance) {
            UsersService.instance = new UsersService(users_repo_1.default.getInstance(), follow_service_1.default.getInstance(), posts_service_1.default.getInstace());
        }
        return UsersService.instance;
    }
}
exports.default = UsersService;
