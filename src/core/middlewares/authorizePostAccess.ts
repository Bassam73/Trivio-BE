import { NextFunction, Request, Response } from "express";
import catchError from "./catchError";
import CommentsService from "../../modules/comments/comments.service";
import AppError from "../utils/AppError";
import { IComment } from "../../types/comment.types";
import PostService from "../../modules/posts/posts.service";
import { IPost, PostType } from "../../types/post.types";
import FollowService from "../../modules/follow/follow.service";
import { FollowStauts } from "../../types/follow.types";
import GroupService from "../../modules/groups/groups.service";
import reactionModel from "../../database/models/reaction.model";

const commentsService = CommentsService.getInstance();
const postService = PostService.getInstace();
const followService = FollowService.getInstance();
const groupService = GroupService.getInstance();
const authorizePostAccess = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    let { id, cid } = req.params;
    let userID = req.user?.id;

    if (req.baseUrl === "/api/v1/reacts" && id) {
      const reaction = await reactionModel.findById(id);
      if (!reaction) throw new AppError("Reaction not found", 404);
      if (reaction.onModel === "comment") {
        cid = reaction.modelId.toString();
        id = undefined as any;
      } else {
        id = reaction.modelId.toString();
      }
    }

    if (!id && cid) {
      const comment: IComment | null = await commentsService.getCommentByID(cid);
      if (!comment) throw new AppError("Comment not found", 404);
      id = comment.postId as unknown as string;
    }
    const post: IPost | null = await postService.getPostbyId(id);
    if (!post) throw new AppError("Post not found", 404);

    if (!post.groupID) {
      if (post.type === PostType.public) return next(); 
      const status = await followService.getRelationshipStatus(
        userID,
        post.authorID as unknown as string,
      );
      if (status === FollowStauts.following || status === "self") {
        return next(); 
      }
      throw new AppError("You are not authorized to access this post", 401);
    } 
    
    const checkMembership: boolean = await groupService.checkGroupMembership(
      userID,
      post.groupID as unknown as string,
    );

    if (checkMembership) return next(); 
    throw new AppError("You are not authorized to access this post", 401);
  },
);
export default authorizePostAccess;
