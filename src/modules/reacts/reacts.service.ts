import AppError from "../../core/utils/AppError";
import ReactsRepository from "./reacts.repo";
import PostService from "../posts/posts.service";
import CommentsRepository from "../comments/comments.repo";
import { createReactionDTO, updateReactionDTO, IReaction } from "../../types/reaction.types";
import { PaginationResult } from "../../types/global";

export default class ReactsService {
  private static instance: ReactsService;
  private repo: ReactsRepository;
  private postService: PostService;
  private commentsRepo: CommentsRepository;

  constructor(repo: ReactsRepository, postService: PostService, commentsRepo: CommentsRepository) {
    this.repo = repo;
    this.postService = postService;
    this.commentsRepo = commentsRepo;
  }

  async createReaction(data: createReactionDTO): Promise<IReaction> {
    const existingReaction = await this.repo.getReactionByUserAndModel(data.userId, data.modelId);
    if (existingReaction) {
      throw new AppError("You have already reacted to this. Use PATCH to update.", 400);
    }

    const reaction = await this.repo.createReaction(data);

    if (data.onModel === "post") {
      await this.postService.incrementReactionsCount(data.modelId, data.reaction);
    } else if (data.onModel === "comment") {
      await this.commentsRepo.incrementReactionsCount(data.modelId);
    }

    return reaction;
  }

  async updateReaction(data: updateReactionDTO): Promise<IReaction> {
    const reaction = await this.repo.getReactionById(data.reactionId);
    if (!reaction) throw new AppError("Reaction not found", 404);

    if (reaction.userId.toString() !== data.userId) {
      throw new AppError("You are not authorized to update this reaction", 403);
    }

    if (reaction.reaction === data.reaction) {
      return reaction;
    }

    const oldReaction = reaction.reaction;
    const newReaction = data.reaction;

    const updatedReaction = await this.repo.updateReactionById(data.reactionId, { reaction: newReaction });

    if (!updatedReaction) throw new AppError("Error updating reaction", 500);

    if (reaction.onModel === "post") {
      await this.postService.decrementReactionsCount(reaction.modelId.toString(), oldReaction);
      await this.postService.incrementReactionsCount(reaction.modelId.toString(), newReaction);
    } 
    return updatedReaction;
  }

  async deleteReaction(id: string, userId: string): Promise<void> {
    const reaction = await this.repo.getReactionById(id);
    if (!reaction) throw new AppError("Reaction not found", 404);

    if (reaction.userId.toString() !== userId) {
      throw new AppError("You are not authorized to delete this reaction", 403);
    }

    const deletedReaction = await this.repo.deleteReactionById(id);
    if (!deletedReaction) throw new AppError("Error deleting reaction", 500);

    // Update counts
    if (reaction.onModel === "post") {
      await this.postService.decrementReactionsCount(reaction.modelId.toString(), reaction.reaction);
    } else if (reaction.onModel === "comment") {
      await this.commentsRepo.decrementReactionsCount(reaction.modelId.toString());
    }
  }

  async getReactionsByModelId(modelId: string, query: any): Promise<PaginationResult<IReaction>> {
    return await this.repo.getReactionsByModelId(modelId, query);
  }

  static getInstance() {
    if (!ReactsService.instance) {
      ReactsService.instance = new ReactsService(
        ReactsRepository.getInstance(),
        PostService.getInstace(),
        CommentsRepository.getInstance()
      );
    }
    return ReactsService.instance;
  }
}
