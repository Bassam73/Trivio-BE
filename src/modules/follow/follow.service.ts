import AppError from "../../core/utils/AppError";
import { FollowStauts, IFollow } from "../../types/follow.types";
import { IUser, UserPrivacy } from "../../types/user.types";
import FollowRepository from "./follow.repo";
import UsersRepository from "../users/users.repo";
import NotificationService from "../notifications/notification.service";
import { createNotificationDTO, EntityType } from "../../types/notification.types";
import UsersService from "../users/users.service";
import mongoose from "mongoose";

export default class FollowService {
  private static instance: FollowService;
  private repo: FollowRepository;
  private userRepo: UsersRepository;

  constructor(repo: FollowRepository, userRepo: UsersRepository) {
    this.repo = repo;
    this.userRepo = userRepo;
  }
  async followUser(
    userID: string,
    follower: string,
    userStatus: UserPrivacy,
  ): Promise<IFollow> {
    if (follower.toString() === userID.toString())
      throw new AppError("You cannot follow yourself", 400);
    const checkFollow = await this.repo.getAFollow(userID, follower);
    if (checkFollow)
      throw new AppError(
        "You already following/requested to follow this user",
        409,
      );
    let follow: IFollow;
    let status;
    status =
      userStatus == UserPrivacy.private
        ? FollowStauts.pending
        : FollowStauts.following;
    follow = await this.repo.createFollow(userID, follower, status);
    if (!follow) throw new AppError("Error While creating follow", 500);

   
      const sender = await UsersService.getInstance().getMe(follower);
      const message =
        status === FollowStauts.pending
          ? `${sender.username} requested to follow you`
          : `${sender.username} started following you`;
      const notifData: createNotificationDTO = {
        sender: sender._id as mongoose.Types.ObjectId,
        receiver: new mongoose.Types.ObjectId(userID),
        message,
        entityID: follow._id as unknown as mongoose.Types.ObjectId,
        entityType: EntityType.FOLLOW,
      };
      await NotificationService.getInstance().createNotificaiton(notifData);
    

    return follow;
  }
  async unFollowUser(
    userID: string,
    followerID: string,
  ): Promise<FollowStauts> {
    const follow = await this.repo.getAFollow(userID, followerID);
    if (!follow)
      throw new AppError(
        "You are not following/requested to follow this user",
        409,
      );
    await this.repo.deleteFollowByID(follow._id);
    await NotificationService.getInstance().deleteNotificationByEntityId(
      follow._id as unknown as string,
    );
    return follow.status;
  }
  async getFollowRequests(
    userID: string,
    privacy: UserPrivacy,
  ): Promise<IFollow[]> {
    console.log(userID);
    if (privacy == UserPrivacy.public)
      throw new AppError(
        "Your Account type is public you dont have follow requests",
        409,
      );
    const followRequests = await this.repo.getFollowRequests(userID);
    console.log(followRequests);
    if (followRequests.length <= 0)
      throw new AppError("No follow requests found for this account", 404);
    return followRequests;
  }

  async acceptFollowRequest(
    requestId: string,
    currentUserId: string,
  ): Promise<IFollow> {
    const request = await this.repo.getFollowRequestById(requestId);
    if (!request) {
      throw new AppError("Follow request not found", 404);
    }
    if (request.userId.toString() !== currentUserId.toString()) {
      throw new AppError("You are not authorized to accept this request", 403);
    }
    if (request.status === FollowStauts.following) {
      throw new AppError("Request already accepted", 400);
    }

    const updatedFollow = await this.repo.updateFollowStatus(
      requestId,
      FollowStauts.following,
    );
    if (!updatedFollow) {
      throw new AppError("Failed to update follow status", 500);
    }

  
    await this.userRepo.incFollowers(request.userId.toString(), 1);
    await this.userRepo.incFollowing(request.follwerId.toString(), 1);

    return updatedFollow;
  }

  async declineFollowRequest(
    requestId: string,
    currentUserId: string,
  ): Promise<void> {
    const request = await this.repo.getFollowRequestById(requestId);
    if (!request) {
      throw new AppError("Follow request not found", 404);
    }
    if (request.userId.toString() !== currentUserId.toString()) {
      throw new AppError("You are not authorized to decline this request", 403);
    }

    await this.repo.deleteFollowRequest(requestId);
    await NotificationService.getInstance().deleteNotificationByEntityId(
      requestId,
    );
  }

  async getFollowers(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IFollow[]> {
    return await this.repo.getFollowers(userId, page, limit);
  }

  async getFollowing(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IFollow[]> {
    return await this.repo.getFollowing(userId, page, limit);
  }

  async getRelationshipStatus(
    currentUserId: string,
    targetUserId: string,
  ): Promise<string> {
    if (currentUserId.toString() === targetUserId.toString()) {
      return "self";
    }

    const follow = await this.repo.getAFollow(targetUserId, currentUserId);
    if (!follow) {
      return "none";
    }

    return follow.status;
  }
  async checkFollowStatusForPosts(currentUserId: string, authorsID: string[]) {
    let follows = await this.repo.checkFollowStatusForPosts(
      currentUserId,
      authorsID,
    );
    return follows;
  }
  async getFollowByID(id: string) {
    return await this.repo.getAFollowByID(id);
  }
  static getInstance() {
    if (!FollowService.instance) {
      FollowService.instance = new FollowService(
        FollowRepository.getInstance(),
        UsersRepository.getInstance(),
      );
    }
    return FollowService.instance;
  }
}
