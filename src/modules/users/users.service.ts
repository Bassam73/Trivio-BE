import AppError from "../../core/utils/AppError";
import { FollowStauts, IFollow } from "../../types/follow.types";
import { IUser, UserPrivacy } from "../../types/user.types";
import FollowService from "../follow/follow.service";
import UsersRepository from "./users.repo";

export default class UsersService {
  private static instance: UsersService;
  private repo: UsersRepository;
  private followSerivce: FollowService;
  constructor(repo: UsersRepository, followService: FollowService) {
    this.repo = repo;
    this.followSerivce = followService;
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

  async getFollowers(userId: string, page: number, limit: number): Promise<IFollow[]> {
    return await this.followSerivce.getFollowers(userId, page, limit);
  }

  async getFollowing(userId: string, page: number, limit: number): Promise<IFollow[]> {
    return await this.followSerivce.getFollowing(userId, page, limit);
  }

  async getRelationshipStatus(targetUserId: string, currentUserId: string): Promise<string> {
    return await this.followSerivce.getRelationshipStatus(currentUserId, targetUserId);
  }
  static getInstance() {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService(
        UsersRepository.getInstance(),
        FollowService.getInstance(),
      );
    }
    return UsersService.instance;
  }
}
