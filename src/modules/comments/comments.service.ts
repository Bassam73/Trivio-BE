import {
  createCommentDTO,
  createReplyDTO,
  IComment,
  updateCommentDTO,
} from "../../types/comment.types";
import { ToxicityFlags } from "../../types/post.types";
import CommentsRepository from "./comments.repo";

import filterQueue from "../../jobs/queues/filterQueue";
import { FilterType, PaginationResult } from "../../types/global";
import AppError from "../../core/utils/AppError";
import PostService from "../posts/posts.service";
import GroupService from "../groups/groups.service";

export default class CommentsService {
  private static instance: CommentsService;
  private repo: CommentsRepository;
  private postService: PostService;
  private groupService: GroupService;

  constructor(
    repo: CommentsRepository,
    postService: PostService,
    groupService: GroupService,
  ) {
    this.repo = repo;
    this.postService = postService;
    this.groupService = groupService;
  }

  async getCommentByID(cid: string): Promise<IComment | null> {
    return await this.repo.getCommentById(cid);
  }

  async checkToxicity(flag: ToxicityFlags, id: string): Promise<void> {
    if (flag == ToxicityFlags.blocked) {
      await this.repo.deleteCommentById(id);
      return;
    }
    if (flag == ToxicityFlags.flagged) {
      await this.repo.updateCommentById(id, { flagged: true });
      return;
    }
  }
  async createComment(data: createCommentDTO): Promise<IComment> {
    const comment = await this.repo.createCommentByPostID(data);
    filterQueue.add("check-filter", {
      id: comment._id as string,
      caption: data.text,
      filterType: FilterType.comment,
    });
    return comment;
  }

  async createReply(data: createReplyDTO): Promise<IComment> {
    const parentComment = await this.repo.getCommentById(data.parent);
    if (!parentComment) throw new AppError("Parent comment not found", 404);

    if (parentComment.parent) {
      throw new AppError("Nested replies are not allowed", 400);
    } // No nested replies

    data.postId = parentComment.postId.toString();

    const reply = await this.repo.createReply(data);
    await this.repo.incrementRepliesCount(data.parent);
    await this.postService.incrementCommentsCount(data.postId);

    filterQueue.add("check-filter", {
      id: reply._id as string,
      caption: data.text,
      filterType: FilterType.comment,
    });

    return reply;
  }

  async getReplies(cid: string, query: any): Promise<PaginationResult<IComment>> {
    const parentComment = await this.repo.getCommentById(cid);
    if (!parentComment) throw new AppError("Parent comment not found", 404);

    return await this.repo.getRepliesByCommentId(cid, query);
  }

  async getPostComments(postId: string, query: any): Promise<PaginationResult<IComment>> {
    const post = await this.postService.getPostbyId(postId);
    if (!post) throw new AppError("Post not found", 404);

    return await this.repo.getCommentsByPostId(postId, query);
  }

  async updateComment(data: updateCommentDTO): Promise<IComment> {
    const comment = await this.repo.getCommentById(data.cid);
    if (!comment) throw new AppError("Comment not found", 404);

    if (comment.userId.toString() !== data.userId) {
      throw new AppError("You are not authorized to update this comment", 403);
    }

    const updatedComment = await this.repo.updateCommentById(data.cid, {
      text: data.text,
      isEdited: true,
      flagged: false, // Reset flagged status on update
    });

    if (!updatedComment) throw new AppError("Error updating comment", 500);

    // Re-check toxicity for updated content
    filterQueue.add("check-filter", {
      id: updatedComment._id as string,
      caption: data.text,
      filterType: FilterType.comment,
    });

    return updatedComment;
  }

  async deleteComment(cid: string, userId: string): Promise<void> {
    const comment = await this.repo.getCommentById(cid);
    if (!comment) throw new AppError("Comment not found", 404);

    const post = await this.postService.getPostbyId(
      comment.postId.toString(),
    );
    if (!post) throw new AppError("Post associated with comment not found", 404);

    let isAuthorized = false;

    if (comment.userId.toString() === userId) {
      isAuthorized = true;
    } else if (post.groupID) {
      // Check if user is group admin/moderator
      try {
        await this.groupService.checkGroupAdmin(
          post.groupID.toString(),
          userId,
        );
        isAuthorized = true;
      } catch (error) {
        // Not admin/moderator
      }
    }

    if (!isAuthorized) {
      throw new AppError("You are not authorized to delete this comment", 403);
    }

    // Delete replies
    await this.repo.deleteRepliesByParentId(cid);

    // Delete comment
    await this.repo.deleteCommentById(cid);
  }

  static getInstance() {
    if (!CommentsService.instance) {
      CommentsService.instance = new CommentsService(
        CommentsRepository.getInstance(),
        PostService.getInstace(),
        GroupService.getInstance(),
      );
    }
    return CommentsService.instance;
  }
}
