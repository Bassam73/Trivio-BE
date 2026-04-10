import AppError from "../../core/utils/AppError";
import { FollowStauts, IFollow } from "../../types/follow.types";
import { IUser, UserPrivacy } from "../../types/user.types";
import FollowService from "../follow/follow.service";
import PostService from "../posts/posts.service";
import GroupService from "../groups/groups.service";
import UsersRepository from "./users.repo";
import NotificationService from "../notifications/notification.service";

import bcrypt from "bcrypt";
import { createMessageDTO } from "../../types/chatbotMessage.types";
import messageModel from "../../database/models/chatBotMessage.model";
import redisClient from "../../config/redis";

export default class UsersService {
  private static instance: UsersService;
  private repo: UsersRepository;
  private followSerivce: FollowService;
  private postService: PostService;
  private groupService: GroupService;
  constructor(
    repo: UsersRepository,
    followService: FollowService,
    groupService: GroupService,
    postService: PostService,
  ) {
    this.repo = repo;
    this.followSerivce = followService;
    this.groupService = groupService;
    this.postService = postService;
  }

  async followUser(userID: string, followerID: string): Promise<IFollow> {
    const user = await this.repo.getUserByID(userID);
    if (!user)
      throw new AppError("User you are trying to follow is not found", 404);
    const follow = await this.followSerivce.followUser(
      user.id,
      followerID,
      user.privacy as UserPrivacy,
    );
    if (follow.status == FollowStauts.following) {
      await this.repo.incFollowers(userID, 1);
      await this.repo.incFollowing(followerID, 1);
    }
    return follow;
  }

  async unFollowUser(userID: string, followerID: string): Promise<void> {
    const user = await this.repo.getUserByID(userID);
    if (!user)
      throw new AppError(
        "User your trying to unfollow/cancel follow request is not found",
        404,
      );
    const followType: FollowStauts = await this.followSerivce.unFollowUser(
      userID,
      followerID,
    );
    if (followType == FollowStauts.following) {
      await this.repo.incFollowers(userID, -1);
      await this.repo.incFollowing(followerID, -1);
    }
  }

  async getFollowers(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IFollow[]> {
    return await this.followSerivce.getFollowers(userId, page, limit);
  }

  async getFollowing(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IFollow[]> {
    return await this.followSerivce.getFollowing(userId, page, limit);
  }

  async getRelationshipStatus(
    targetUserId: string,
    currentUserId: string,
  ): Promise<string> {
    return await this.followSerivce.getRelationshipStatus(
      currentUserId,
      targetUserId,
    );
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }
  async getAnotherUser(
    userId: string,
    currentUserId: string,
  ): Promise<{ user: IUser; relationshipStatus: string }> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);
    const relationshipStatus = await this.followSerivce.getRelationshipStatus(
      currentUserId,
      userId,
    );
    return { user, relationshipStatus };
  }

  async getLikedPosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<any> {
    return await this.repo.getLikedPostIds(userId, page, limit);
  }

  async getBulkLikedPosts(postIds: string[]): Promise<any> {
    return await this.postService.getPostsByIds(postIds);
  }
  async getUserPosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<any> {
    return await this.postService.getUsersPosts(userId, page, limit);
  }

  // update existing user data and it is also the way for the user to add fav teams , players and avatar
  async updateProfile(userId: string, data: any): Promise<IUser> {
    const currentUser = await this.repo.getUserByID(userId);
    if (!currentUser) throw new AppError("User not found", 404);

    const allowedUpdates = [
      "favPlayers",
      "favTeams",
      "bio",
      "avatar",
      "username",
    ];
    const updateOp: any = {};
    if (data) {
      console.log(data);
      Object.keys(data).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          let value = data[key];
          if (
            (key === "favTeams" || key === "favPlayers") &&
            typeof data[key] === "string"
          ) {
            try {
              value = JSON.parse(data[key]);
            } catch (error) {
              value = data[key];
            }
          }

          if (key === "username" && value === currentUser.username) {
            return;
          }
          if (key === "favTeams" || key === "favPlayers") {
            if (!updateOp.$addToSet) updateOp.$addToSet = {};
            updateOp.$addToSet[key] = {
              $each: Array.isArray(value) ? value : [value],
            };
          } else {
            if (!updateOp.$set) updateOp.$set = {};
            updateOp.$set[key] = value;
          }
        }
      });
    }

    if (Object.keys(updateOp).length === 0) return currentUser;

    console.log(updateOp);
    const updatedUser = await this.repo.updateProfile(userId, updateOp);
    if (!updatedUser) throw new AppError("User not found", 404);
    return updatedUser;
  }

  async getFavTeams(userId: string): Promise<any> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);
    return user.favTeams;
  }
  async getFavPlayers(userId: string): Promise<any> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);
    return user.favPlayers;
  }

  async removeTeam(userId: string, teamsToRemove: string[]): Promise<IUser> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);
    const updatedUser = await this.repo.removeTeam(userId, teamsToRemove);
    if (!updatedUser) throw new AppError("User not found", 404);
    return updatedUser;
  }

  async removePlayer(
    userId: string,
    playersToRemove: string[],
  ): Promise<IUser> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);
    const updatedUser = await this.repo.removePlayer(userId, playersToRemove);
    if (!updatedUser) throw new AppError("Error updating user", 400);
    return updatedUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);
    if (!user.isVerified) throw new AppError("User is not verified", 400);
    if (!user.password)
      throw new AppError("User does not have a password set", 400);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError("Invalid current password", 400);

    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS!),
    );
    await this.repo.changePassword(userId, hashedNewPassword);
  }

  async suggestUsers(userId: string, limit: number = 10): Promise<IUser[]> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);

    // 1. Get users I already follow to exclude them
    const myFollowing = await this.followSerivce.getFollowing(userId, 1, 100);
    const myFollowingIds = myFollowing.map((f: any) =>
      (f.following._id || f.following).toString(),
    );

    // 2. Friends of Friends
    const fofCandidates = new Set<string>();
    const friendsToCheck = myFollowing.slice(0, 5);

    await Promise.all(
      friendsToCheck.map(async (friendFollow: any) => {
        const friendId = (
          friendFollow.following._id || friendFollow.following
        ).toString();
        const friendsFollowings = await this.followSerivce.getFollowing(
          friendId,
          1,
          20,
        );

        friendsFollowings.forEach((f: any) => {
          const candidateId = (f.following._id || f.following).toString();
          // Exclude myself and people I already follow
          if (candidateId !== userId && !myFollowingIds.includes(candidateId)) {
            fofCandidates.add(candidateId);
          }
        });
      }),
    );

    let suggestions: IUser[] = [];
    const fofIds = Array.from(fofCandidates);

    if (fofIds.length > 0) {
      suggestions = await this.repo.getUsersByIds(fofIds.slice(0, limit));
    }

    // 3. Interest based
    if (suggestions.length < limit) {
      const { favTeams = [], favPlayers = [] } = user;
      const remainingLimit = limit - suggestions.length;
      const excludeIds = [
        ...myFollowingIds,
        ...suggestions.map((u: any) => u._id.toString()),
      ];

      if (favTeams.length > 0 || favPlayers.length > 0) {
        const interestUsers = await this.repo.findUsersBySharedInterests(
          userId,
          excludeIds,
          favTeams,
          favPlayers,
          remainingLimit,
        );
        suggestions = [...suggestions, ...interestUsers];
      }
    }

    return suggestions;
  }
  // import { Request, Response } from "express";
  // The URL of your deployed Python FastAPI (Captain Magdy)
  // Make sure to put this in your .env file in production!
  // const MAGDY_API_URL = process.env.MAGDY_API_URL || "http://127.0.0.1:8000/chat";

  // export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { threadId } = req.params;

  //     if (!threadId) {
  //       res.status(400).json({ error: "threadId parameter is required." });
  //       return;
  //     }

  //     // Fetch messages for this thread, sorted by creation time (oldest first)
  //     // We select only the fields the frontend needs to render the chat bubbles
  //     const messages = await messageModel
  //       .find({ threadId })
  //       .sort({ createdAt: 1 })
  //       .select("senderType text createdAt -_id");

  //     res.status(200).json({
  //       success: true,
  //       data: messages,
  //     });

  //   } catch (error) {
  //     console.error("Error in getChatHistory:", error);
  //     res.status(500).json({ error: "Failed to retrieve chat history." });
  //   }
  // };

  async getMyJoinedGroups(userID: string, query: any) {
    return await this.groupService.getUserJoinedGroups(userID, query);
  }

  async getMyGroups(userID: string, query: any) {
    return await this.groupService.getMyGroups(userID, query);
  }

  async getChatbotHistory(userID: string) {
    if (!userID) {
      throw new AppError("userID parameter is required.", 400);
    }

    const messages = await messageModel
      .find({ threadId: userID })
      .sort({ createdAt: 1 })
      .select("senderType text createdAt -_id");

    return messages;
  }

  async getUnreadNotifications(userId: string) {
    return await NotificationService.getInstance().getUnreadNotifications(
      userId,
    );
  }

  async sendMessageChatbot(userID: string, message: string) {
    const chatbotUrl =
      process.env.CHATBOT_API_URL || "http://127.0.0.1:8000/chat";

    if (!userID || !message) {
      throw new AppError("userID and message are required.", 400);
    }

    const humanMessageData: createMessageDTO = {
      threadId: userID,
      senderType: "human",
      text: message,
    };
    await messageModel.create(humanMessageData);

    const aiResponse = await fetch(chatbotUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userID, message: message }),
    });

    if (!aiResponse.ok) {
      throw new AppError(
        `Python API responded with status ${aiResponse.status}`,
        502,
      );
    }

    const aiData = await aiResponse.json();
    const agentText = aiData.message;

    const aiMessageData: createMessageDTO = {
      threadId: userID,
      senderType: "ai",
      text: agentText,
    };
    await messageModel.create(aiMessageData);

    return {
      senderType: "ai",
      text: agentText,
    };
  }
  async getUserPostsByID(targetUserId: string, currentUserID: string) {
    const targetUser = await this.repo.getUserByID(targetUserId);
    if (!targetUser) throw new AppError("Target user is not found", 404);
    const follow = await this.followSerivce.getRelationshipStatus(
      currentUserID,
      targetUserId,
    );
    if (targetUser.privacy == UserPrivacy.private) {
      if (follow == "none" || follow == "pedning")
        throw new AppError(
          "You are not authorized to access this user's posts follow him first",
          403,
        );
    }
    const posts = await PostService.getInstace().getUserPostsById(targetUserId);
    return {
      posts,
      isFollowing: follow == "following" ? true : false,
    };
  }
  async savePost(userId: string, postId: string): Promise<boolean> {
    return await this.repo.savePost(userId, postId);
  }

  async unsavePost(userId: string, postId: string): Promise<boolean> {
    return await this.repo.unsavePost(userId, postId);
  }
  async registerFcmToken(userId: string, token: string): Promise<void> {
    await this.repo.addFcmToken(userId, token);
  }

  async unregisterFcmToken(userId: string, token: string): Promise<void> {
    await this.repo.removeFcmToken(userId, token);
  }

  async incrementUsersPostsCount(userID: string) {
    return await this.repo.incrementUserPostsCount(userID);
  }
  async decrementUserPostsCount(userId: string) {
    return await this.repo.decrementUserPostsCount(userId);
  }
  async getSavedPosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<string[]> {
    return await this.repo.getSavedPosts(userId, page, limit);
  }

  async isSavedPost(userId: string, postId: string): Promise<boolean> {
    return await this.repo.isSavedPost(userId, postId);
  }

  async MarkPostsAsSeen(userId: string, postsID: string[]) {
    const redisKey = `user:${userId}:seen`;
    await Promise.all(
      postsID.map(async (id) => {
        const post = await PostService.getInstace().getPostbyId(id);
        if (!post) throw new AppError(`PostId : ${id} Not Found`, 404);
        await redisClient.set(redisKey, id);
      }),
    );
    await redisClient.expire(redisKey, 604800);
  }
  static getInstance() {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService(
        UsersRepository.getInstance(),
        FollowService.getInstance(),
        GroupService.getInstance(),
        PostService.getInstace(),
      );
    }
    return UsersService.instance;
  }
}
