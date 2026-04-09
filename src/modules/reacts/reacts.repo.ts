import ApiFeatures from "../../core/utils/ApiFeatures";
import reactionModel from "../../database/models/reaction.model";
import { PaginationResult } from "../../types/global";
import {
  createReactionDTO,
  IReaction,
  updateReactionDTO,
} from "../../types/reaction.types";

export default class ReactsRepository {
  private static instance: ReactsRepository;
  constructor() {}

  async createReaction(data: createReactionDTO): Promise<IReaction> {
    return await reactionModel.create(data);
  }

  async getReactionById(id: string): Promise<IReaction | null> {
    return await reactionModel.findById(id);
  }

  async getReactionByUserAndModel(
    userId: string,
    modelId: string,
  ): Promise<IReaction | null> {
    return await reactionModel.findOne({ userId, modelId });
  }

  async deleteReactionById(id: string): Promise<IReaction | null> {
    return await reactionModel.findByIdAndDelete(id);
  }

  async deleteReactionsByModelId(modelId: string): Promise<number> {
    const result = await reactionModel.deleteMany({ modelId });
    return result.deletedCount || 0;
  }

  async getReactionsIdsByModelId(modelId: string): Promise<string[]> {
    const reactions = await reactionModel.find({ modelId }).select("_id");
    return reactions.map((r) => r._id.toString());
  }

  async updateReactionById(id: string, data: any): Promise<IReaction | null> {
    return await reactionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async getReactionsByModelId(
    modelId: string,
    searchQuery: any,
  ): Promise<PaginationResult<IReaction>> {
    const apiFeatures = new ApiFeatures<IReaction>(
      reactionModel
        .find({ modelId: modelId })
        .populate("userId", "username profilePicture"),
      searchQuery,
    )
      .filter()
      .search()
      .sort()
      .fields()
      .pagination(searchQuery.limit || 10);

    const result: PaginationResult<IReaction> = {
      data: await apiFeatures.getQuery(),
      page: apiFeatures.getPageNumber(),
    };
    return result;
  }
  async getReactionsByPostsIDs(userID: string, postsID: string[]) {
    return await reactionModel
      .find({
        onModel: "post",
        modelId: { $in: postsID },
        userId: userID,
      })
      .select("modelId reaction -_id");
  }

  static getInstance() {
    if (!ReactsRepository.instance) {
      ReactsRepository.instance = new ReactsRepository();
    }
    return ReactsRepository.instance;
  }
}
