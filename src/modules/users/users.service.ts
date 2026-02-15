import AppError from "../../core/utils/AppError";
import { FollowStauts, IFollow } from "../../types/follow.types";
import { IUser, UserPrivacy } from "../../types/user.types";
import FollowService from "../follow/follow.service";
import PostService from "../posts/posts.service";
import UsersRepository from "./users.repo";
export default class UsersService {
  private static instance: UsersService;
  private repo: UsersRepository;
  private followSerivce: FollowService;
  private postService: PostService;
  constructor(repo: UsersRepository, followService: FollowService, postService: PostService) {
    this.repo = repo;
    this.followSerivce = followService;
    this.postService = postService
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

  async getMe(userId: string): Promise<IUser> {
    const user = await this.repo.getUserByID(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async getLikedPosts(userId: string, page: number, limit: number): Promise<any> {
      return await this.repo.getLikedPostIds(userId, page, limit);
  }
  
  async getBulkLikedPosts(postIds: string[]): Promise<any> {
    return await this.postService.getPostsByIds(postIds);
  }
  async getUserPosts(userId: string, page: number, limit: number): Promise<any> { 
    return await this.postService.getUsersPosts(userId, page, limit);
  }


  async updateProfile(userId: string, data: any): Promise<IUser> {
    
    const allowedUpdates = ['favPlayers', 'favTeams', 'bio', 'avatar','username'];
    const safeData: any = {};
    if (data) {
      console.log(data)
      Object.keys(data).forEach(key => {
          if (allowedUpdates.includes(key)) {
              safeData[key] = data[key];
          }
      });
    }

    console.log(safeData);
    const updatedUser = await this.repo.updateProfile(userId, safeData);
    if (!updatedUser) throw new AppError("User not found", 404);
    return updatedUser;
  }

  async togglePrivacy(userId: string): Promise<void> { 
    
  }

  static getInstance() {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService(
        UsersRepository.getInstance(),
        FollowService.getInstance(),
        PostService.getInstace(),
      );
    }
    return UsersService.instance;
  }
}
