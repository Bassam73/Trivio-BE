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

 async getLikedPostIds(userId: string, page: number, limit: number): Promise<string[]> {
  const user = await userModel.findById(userId)
    .select("likedPosts") 
    .populate({
      path: "likedPosts",
      select: "post",
      options: {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { createdAt: -1 } 
      },
    });

  if (!user || !user.likedPosts) {
    return [];
  }
  const postIds = user.likedPosts.map((like: any) => like.post);
  return postIds;
}

 async updateProfile(userId: string, data: any): Promise<IUser | null> {
  return await userModel.findByIdAndUpdate(userId, data, { new: true ,runValidators: true});
}

  async removeTeam(userId: string, teamsToRemove: string[]): Promise<IUser | null> {
    console.log(teamsToRemove);
    return await userModel.findByIdAndUpdate(
      userId,
      {
        $pull: { favTeams: { $in: teamsToRemove } },
      },
      { new: true },
    );
  }
  async removePlayer(userId: string, playersToRemove: string[]): Promise<IUser | null> {
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
      {runValidators: true}
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
    limit: number
  ): Promise<IUser[]> {
    return await userModel.find({
      _id: { $nin: [userId, ...excludeIds] },
      $or: [{ favTeams: { $in: favTeams } }, { favPlayers: { $in: favPlayers } }],
    }).limit(limit);
  }

  static getInstance() {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository();
    }
    return UsersRepository.instance;
  }
}
