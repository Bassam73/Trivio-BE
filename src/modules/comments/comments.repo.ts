import ApiFeatures from "../../core/utils/ApiFeatures";
import commentModel from "../../database/models/comment.model";
import { createCommentDTO, createReplyDTO, IComment } from "../../types/comment.types";
import { PaginationResult } from "../../types/global";

export default class CommentsRepository {
  private static instance: CommentsRepository;

  async getCommentById(cid: string): Promise<IComment | null> {
    return await commentModel.findById(cid);
  }
  async createCommentByPostID(data: createCommentDTO): Promise<IComment> {
    return await commentModel.create(data);
  }
  async deleteCommentById(cid: string): Promise<IComment | null> {
    return await commentModel.findByIdAndDelete(cid);
  }
  async deleteRepliesByParentId(parentId: string): Promise<number> {
    const result = await commentModel.deleteMany({ parent: parentId });
    return result.deletedCount || 0;
  }
  async updateCommentById(cid: string, data: any): Promise<IComment | null> {
    return await commentModel.findByIdAndUpdate(cid, data , {new:true });
  }

  async createReply(data: createReplyDTO): Promise<IComment> {
    return await commentModel.create(data);
  }

  async getRepliesByCommentId(cid: string, searchQuery: any): Promise<PaginationResult<IComment>> {
    const apiFeatures = new ApiFeatures<IComment>(
      commentModel.find({ parent: cid }),
      searchQuery
    )
      .filter()
      .search()
      .sort()
      .fields()
      .pagination(searchQuery.limit || 10);

    // Default sorting by creation time ascending, so new replies append to the end.
    if (!searchQuery.sort) {
      apiFeatures.getQuery().sort('createdAt');
    }

    const result: PaginationResult<IComment> = {
      data: await apiFeatures.getQuery(),
      page: apiFeatures.getPageNumber(),
    };
    return result;
  }

  async getCommentsByPostId(postId: string, searchQuery: any): Promise<PaginationResult<IComment>> {
    const apiFeatures = new ApiFeatures<IComment>(
      commentModel.find({ postId: postId, parent: { $exists: false } }),
      searchQuery
    )
      .filter()
      .search()
      .sort()
      .fields()
      .pagination(searchQuery.limit || 10);

    // Default sorting by creation time descending (recent first)
    if (!searchQuery.sort) {
      apiFeatures.getQuery().sort('-createdAt');
    }

    const result: PaginationResult<IComment> = {
      data: await apiFeatures.getQuery(),
      page: apiFeatures.getPageNumber(),
    };
    return result;
  }

  async incrementRepliesCount(cid: string): Promise<IComment | null> {
    return await commentModel.findByIdAndUpdate(
      cid,
      { $inc: { repliesCount: 1 } },
      { new: true }
    );
  }
  async decrementRepliesCount(cid: string): Promise<IComment | null> {
    return await commentModel.findByIdAndUpdate(
      cid,
      { $inc: { repliesCount: -1 } },
      { new: true }
    );
  }
  async incrementReactionsCount(cid: string): Promise<IComment | null> {
    return await commentModel.findByIdAndUpdate(
      cid,
      { $inc: { reactionsCount: 1 } },
      { new: true }
    );
  }
  async decrementReactionsCount(cid: string): Promise<IComment | null> {
    return await commentModel.findByIdAndUpdate(
      cid,
      { $inc: { reactionsCount: -1 } },
      { new: true }
    );
  }
  static getInstance() {
    if (!CommentsRepository.instance) {
      CommentsRepository.instance = new CommentsRepository();
    }
    return CommentsRepository.instance;
  }
}
