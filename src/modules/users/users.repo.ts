import savedPostModel from "../../database/models/savedPosts.model";
import userModel from "../../database/models/user.model";
import { IUser } from "../../types/user.types";

export default class UsersRepository {
  private static instance: UsersRepository;
  async getUserByID(id: string): Promise<IUser | null> {
    return await userModel.findById(id);
  }
  async incFollowing(userID: string, value: number): Promise<IUser | null> {
    return await userModel.findByIdAndUpdate(
      userID,
      {
        $inc: { following: value },
      },
      { new: true },
    );
  }
  async incFollowers(userID: string, value: number): Promise<IUser | null> {
    return await userModel.findByIdAndUpdate(
      userID,
      {
        $inc: { followers: value },
      },
      { new: true },
    );
  }

  async getLikedPostIds(
    userId: string,
    page: number,
    limit: number,
  ): Promise<string[]> {
    const user = await userModel
      .findById(userId)
      .select("likedPosts")
      .populate({
        path: "likedPosts",
        select: "post",
        options: {
          skip: (page - 1) * limit,
          limit: limit,
          sort: { createdAt: -1 },
        },
      });

    if (!user || !user.likedPosts) {
      return [];
    }
    const postIds = user.likedPosts.map((like: any) => like.post);
    return postIds;
  }

  async updateProfile(userId: string, data: any): Promise<IUser | null> {
    return await userModel.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
  }

  async removeTeam(
    userId: string,
    teamsToRemove: string[],
  ): Promise<IUser | null> {
    console.log(teamsToRemove);
    return await userModel.findByIdAndUpdate(
      userId,
      {
        $pull: { favTeams: { $in: teamsToRemove } },
      },
      { new: true },
    );
  }
  async removePlayer(
    userId: string,
    playersToRemove: string[],
  ): Promise<IUser | null> {
    console.log(playersToRemove);
    return await userModel.findByIdAndUpdate(
      userId,
      {
        $pull: { favPlayers: { $in: playersToRemove } },
      },
      { new: true },
    );
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    await userModel.findByIdAndUpdate(
      userId,
      {
        password: newPassword,
      },
      { runValidators: true },
    );
  }

  async getUsersByIds(ids: string[]): Promise<IUser[]> {
    return await userModel.find({ _id: { $in: ids } });
  }

  async findUsersBySharedInterests(
    userId: string,
    excludeIds: string[],
    favTeams: string[],
    favPlayers: string[],
    limit: number,
  ): Promise<IUser[]> {
    return await userModel
      .find({
        _id: { $nin: [userId, ...excludeIds] },
        $or: [
          { favTeams: { $in: favTeams } },
          { favPlayers: { $in: favPlayers } },
        ],
      })
      .limit(limit);
  }
  async savePost(userId: string, postId: string): Promise<boolean> {
    const savedPost = await savedPostModel.findOneAndUpdate(
      { userId, postId },
      { userId, postId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return !!savedPost;
  }

  async unsavePost(userId: string, postId: string): Promise<boolean> {
    const result = await savedPostModel.deleteOne({ userId, postId });
    return result.deletedCount > 0;
  }

  async getSavedPosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<string[]> {
    const savedPosts = await savedPostModel
      .find({ userId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return savedPosts.map((saved: any) => saved.postId);
  }

  async isSavedPost(userId: string, postId: string): Promise<boolean> {
    const saved = await savedPostModel.findOne({ userId, postId });
    return !!saved;
  }

  async incrementUserPostsCount(userID: string) {
    const result = await userModel.findByIdAndUpdate(
      userID,
      { $inc: { posts: 1 } },
      { new: true },
    );
    console.log(
      "البيانات في الداتابيز حالياً:",
      await userModel.findById(userID).select("posts"),
    );
  }
  async decrementUserPostsCount(userID: string) {
    return await userModel.findByIdAndUpdate(userID, { $inc: { posts: -1 } });
  }

  async addFcmToken(userId: string, token: string): Promise<void> {
    await userModel.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });
  }

  async removeFcmToken(userId: string, token: string): Promise<void> {
    await userModel.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: token },
    });
  }

  async getFcmTokens(userId: string): Promise<string[]> {
    const user = await userModel
      .findById(userId)
      .select("fcmTokens")
      .lean<{ fcmTokens?: string[] }>();
    return user?.fcmTokens ?? [];
  }

  static getInstance() {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository();
    }
    return UsersRepository.instance;
  }
}
