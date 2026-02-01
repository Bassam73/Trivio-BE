import followModel from "../../database/models/follow.model";
import { FollowStauts, IFollow } from "../../types/follow.types";

export default class FollowRepository {
  private static instance: FollowRepository;
  async createFollow(
    userID: string,
    followerID: string,
    status: FollowStauts,
  ): Promise<IFollow> {
    return await followModel.create({
      userId: userID,
      follwerId: followerID,
      status,
    });
  }
  async getAFollow(
    userID: string,
    followerID: string,
  ): Promise<IFollow | null> {
    return await followModel.findOne({ userId: userID, follwerId: followerID });
  }
  async deleteFollowByID(followID: string) {
    await followModel.findByIdAndDelete(followID);
  }
  async getFollowRequests(userID: string): Promise<IFollow[]> {
    return await followModel
      .find({
        userId: userID,
        status: FollowStauts.pending,
      })
      .populate("follwerId");
  }
  async getFollowRequestById(requestId: string): Promise<IFollow | null> {
    return await followModel.findById(requestId);
  }

  async updateFollowStatus(followId: string, status: FollowStauts): Promise<IFollow | null> {
    return await followModel.findByIdAndUpdate(
      followId,
      { status },
      { new: true }
    );
  }

  async deleteFollowRequest(requestId: string): Promise<void> {
    await followModel.findByIdAndDelete(requestId);
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 10): Promise<IFollow[]> {
    const skip = (page - 1) * limit;
    return await followModel
      .find({ userId: userId, status: FollowStauts.following })
      .populate("follwerId")
      .skip(skip)
      .limit(limit);
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 10): Promise<IFollow[]> {
    const skip = (page - 1) * limit;
    return await followModel
      .find({ follwerId: userId, status: FollowStauts.following })
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
