import mongoose from "mongoose";
import AppError from "../../core/utils/AppError";
import {
  createPostDTO,
  IPost,
  ToxicityFlags,
  updatePostDTO,
} from "../../types/post.types";
import { IUser } from "../../types/user.types";
import AuthRepository from "../auth/auth.repo";
import PostRepository from "./posts.repo";
import axios from "axios";
import fs from "fs";
import getMentionedUsers from "../../core/utils/mentionedUsers";
import filterQueue from "../../jobs/queues/filterQueue";
import ApiFeatures from "../../core/utils/ApiFeatures";
import { FilterType, PaginationResult } from "../../types/global";
import { createCommentDTO, IComment } from "../../types/comment.types";
import CommentsService from "../comments/comments.service";
import CommentsRepository from "../comments/comments.repo";
import ReactsRepository from "../reacts/reacts.repo";
import FollowService from "../follow/follow.service";
import ReactsService from "../reacts/reacts.service";
import UsersService from "../users/users.service";
import { EntityType } from "../../types/notification.types";
import NotificationService from "../notifications/notification.service";

export default class PostService {
  private static instance: PostService;
  private repo: PostRepository;
  private userRepo: AuthRepository;
  constructor(repo: PostRepository, userRepo: AuthRepository) {
    this.repo = repo;
    this.userRepo = userRepo;
  }
  async checkToxicity(flag: ToxicityFlags, id: string): Promise<void> {
    if (flag == ToxicityFlags.blocked) {
      await this.repo.deletePostById(id);
      return;
    }
    if (flag == ToxicityFlags.flagged) {
      await this.repo.updatePostById(id, { flagged: true });
      return;
    }
  }
  async createPost(data: createPostDTO) {
    console.time("Total Logic Time");
    if (data.caption) {
      const caption: string = data.caption;

      console.time("Mentions ");
      const mentions: IUser[] | null = await getMentionedUsers(caption);
      console.timeEnd("Mentions ");
      if (mentions) {
        data.mentions = mentions;
      }
    }
    console.time("DB Save");
    const post = await this.repo.createPost(data);
    if (data.caption)
      filterQueue.add("check-filter", {
        id: post._id as string,
        caption: data.caption,
        filterType: FilterType.post,
      });
    console.timeEnd("DB Save");
    console.timeEnd("Total Logic Time");
    console.log(data.authorID);
    const authorID = post.authorID.toString();

    await UsersService.getInstance().incrementUsersPostsCount(authorID);
    return post;
  }

  async getPublicPosts(userID: string): Promise<object[]> {
    const res = await axios.get(`${process.env.RECOMMENDER_API_URL}${userID}`);
    const posts: IPost[] = res.data.data;
    const authorsID: string[] = posts.map((post) => {
      return post.authorID._id as unknown as string;
    });
    const postsID: string[] | null = posts.map((post) => {
      return post._id as string;
    });
    const reactsObj = await ReactsService.getInstance().getReactionsByPostsIDs(
      userID,
      postsID,
    );
    const reactsMap: Map<string, string> = new Map<string, string>();
    reactsObj.map((react) => {
      reactsMap.set(react.modelId.toString(), react.reaction);
    });
    let follows = await FollowService.getInstance().checkFollowStatusForPosts(
      userID,
      authorsID,
    );
    let followsSet: Set<string> = new Set<string>();
    follows.map((follow) => followsSet.add(follow.userId.toString()));
    let response: object[] = posts.map((post) => {
      return {
        post: post,
        isFollowed: followsSet.has(post.authorID._id as unknown as string),
        userReact: reactsMap.has(post._id as string)
          ? reactsMap.get(post._id as string)
          : null,
      };
    });
    return response;
  }

  async getPublicPostsById(id: string, userID: string) {
    const post = await this.repo.getPostById(id);
    if (!post) throw new AppError("post not found", 404);
    if (post.type !== "public") throw new AppError("post is not public", 403);

    const postIdStr = String(post._id);
    const authorIdStr = String(post.authorID._id);

    const [reactsObj, follows] = await Promise.all([
      ReactsService.getInstance().getReactionsByPostsIDs(userID, [postIdStr]),
      FollowService.getInstance().checkFollowStatusForPosts(userID, [
        authorIdStr,
      ]),
    ]);
    const userReact = reactsObj.length > 0 ? reactsObj[0].reaction : null;
    const isFollowed = follows.length > 0;
    return {
      post: post,
      isFollowed: isFollowed,
      userReact: userReact,
    };
  }
  async getPublicPostById(id: string): Promise<IPost> {
    const post = await this.repo.getPostById(id);
    if (!post) throw new AppError("post not found", 404);
    if (post.type !== "public") throw new AppError("post is not public", 403);
    return post;
  }

  async getPostbyId(id: string): Promise<IPost | null> {
    return await this.repo.getPostByID(id);
  }

  async getPublicReels(): Promise<IPost[]> {
    return await this.repo.getPublicReels();
  }
  async sharePost(userId: string, originalPostId: string, payload: any = {}): Promise<IPost> {
    const originalPost = await this.repo.getPostById(originalPostId);
    if (!originalPost) throw new AppError("original post not found", 404);
    if (originalPost.type === "private") {
      throw new AppError("Private posts cannot be shared", 403);
    }
    if (!payload.type) {
      throw new AppError("Post type is required", 400);
    }

    const rootPostId = originalPost.sharedFrom ? originalPost.sharedFrom.toString() : originalPostId;

    const data: createPostDTO = {
      authorID: new mongoose.Types.ObjectId(userId),
      sharedFrom: new mongoose.Types.ObjectId(rootPostId),
      type: payload.type,
      caption: payload.caption || "",
      location: "profile",
    };

    if (data.caption) {
      const mentions: IUser[] | null = await getMentionedUsers(data.caption);
      if (mentions) {
        data.mentions = mentions;
      }
    }

    const post = await this.repo.createPost(data);

    if (data.caption) {
      filterQueue.add("check-filter", {
        id: post._id as string,
        caption: data.caption,
        filterType: FilterType.post,
      });
    }

    await this.repo.incrementSharesCount(originalPostId);
    if (rootPostId !== originalPostId) {
      await this.repo.incrementSharesCount(rootPostId);
    }

    await UsersService.getInstance().incrementUsersPostsCount(userId);

   
    const originalAuthorId = typeof originalPost.authorID === "object" ? (originalPost.authorID as any)._id : originalPost.authorID;
    
    if (originalAuthorId.toString() !== userId) {
      await NotificationService.getInstance().createNotificaiton({
        sender: new mongoose.Types.ObjectId(userId),
        receiver: new mongoose.Types.ObjectId(originalAuthorId.toString()),
        entityID: post._id as unknown as mongoose.Types.ObjectId,
        entityType: EntityType.POST,
        message: "shared your post",
        postId: post._id as unknown as mongoose.Types.ObjectId,
      });
    }

    return post;
  }

  async deletePostById(postId: string, userId: mongoose.Types.ObjectId) {
    const post = await this.repo.getPostById(postId);
    if (!post) throw new AppError("post not found", 404);
    console.log(post.authorID._id, userId);
    if (post.authorID._id.toString() !== userId.toString()) {
      throw new AppError("you are not authorized to delete this post", 403);
    }

    await this.cascadeDeletePostRelations(postId);
    const deletedPost = await this.repo.deletePostById(postId);
    await UsersService.getInstance().decrementUserPostsCount(
      userId as unknown as string,
    );
  }
  async updatePostById(data: updatePostDTO): Promise<IPost | null> {
    const post = await this.repo.getPostById(data.postID.toString());
    if (!post) throw new AppError("post not found", 404);
    if (post.authorID.toString() !== data.userID.toString()) {
      throw new AppError("you are not authorized to update this post", 403);
    }

    if (data.updatedData.caption === undefined) {
      return await this.repo.updatePostById(data.postID.toString(), {
        type: data.updatedData.type,
      });
    }
    if (data.updatedData.caption === "") {
      return await this.repo.updatePostById(data.postID.toString(), {
        caption: "",
        mentions: [],
        flagged: false,
        type: data.updatedData.type,
      });
    }
    filterQueue.add("check-filter", {
      id: data.postID.toString(),
      caption: data.updatedData.caption,
      filterType: FilterType.post,
    });
    const updates: any = {
      caption: data.updatedData.caption,
      type: data.updatedData.type,
      mentions: await getMentionedUsers(data.updatedData.caption),
      flagged: false,
    };
    const updatedPost = await this.repo.updatePostById(
      data.postID.toString(),
      updates,
    );
    return updatedPost;
  }
  async deleteGroupPost(postId: string): Promise<IPost> {
    const post = await this.repo.getPostById(postId);
    if (!post) throw new AppError("post not found", 404);
    await this.cascadeDeletePostRelations(postId);
    const deletedPost = await this.repo.deletePostById(postId);
    if (!deletedPost) throw new AppError("error while deleting post", 500);
    return deletedPost;
  }

  private async cascadeDeletePostRelations(postId: string) {
    await ReactsRepository.getInstance().deleteReactionsByModelId(postId);
    const comments =
      await CommentsRepository.getInstance().getAllCommentsByPostId(postId);
    await Promise.all(
      comments.map((comment) =>
        ReactsRepository.getInstance().deleteReactionsByModelId(
          comment._id as string,
        ),
      ),
    );
    await CommentsRepository.getInstance().deleteCommentsByPostId(postId);
  }

  async getUsersPosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IPost[]> {
    return (await this.repo.findPostsByUserId(userId, page, limit)) as IPost[];
  }

  async getPostsByIds(postIds: string[]): Promise<IPost[]> {
    return await this.repo.findPostsByIds(postIds);
  }

  async createComment(postID: createCommentDTO): Promise<IComment> {
    return await CommentsService.getInstance().createComment(postID);
  }
  async getPostComments(
    postId: string,
    query: any,
  ): Promise<PaginationResult<IComment>> {
    return await CommentsService.getInstance().getPostComments(postId, query);
  }
  async incrementCommentsCount(postId: string): Promise<IPost | null> {
    return await this.repo.incrementCommentsCount(postId);
  }
  async decrementCommentsCount(
    postId: string,
    count: number,
  ): Promise<IPost | null> {
    return await this.repo.decrementCommentsCount(postId, count);
  }
  async incrementReactionsCount(
    postId: string,
    reaction: string,
  ): Promise<IPost | null> {
    return await this.repo.incrementReactionsCount(postId, reaction);
  }
  async decrementReactionsCount(
    postId: string,
    reaction: string,
  ): Promise<IPost | null> {
    return await this.repo.decrementReactionsCount(postId, reaction);
  }
  async getGroupPosts(
    groupId: string,
    query: string,
  ): Promise<PaginationResult<IPost>> {
    return this.repo.getGroupPosts(groupId, query);
  }
  async getUserPostsById(userID: string) {
    const posts = await this.repo.getUserPostsByID(userID);
    if (posts.length == 0)
      throw new AppError("There is no posts for this user", 404);
    return posts;
  }
  static getInstace() {
    if (!PostService.instance) {
      PostService.instance = new PostService(
        PostRepository.getInstace(),
        AuthRepository.getInstance(),
      );
    }
    return PostService.instance;
  }
}
