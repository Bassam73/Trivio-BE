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
// import filterQueue from "../../jobs/queues/filterQueue";
import ApiFeatures from "../../core/utils/ApiFeatures";
import { PaginationResult } from "../../types/global";

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
    try {
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
        // filterQueue.add("check-filter", {
        //   postID: post._id as string,
        //   caption: data.caption,
        // });
      console.timeEnd("DB Save");
      console.timeEnd("Total Logic Time");

      return post;
    } catch (error) {
      if (data.media && data.media.length > 0) {
        await Promise.all(
          data.media.map((media) => {
            const filename = media.split("/").pop(); // Extract filename from URL
            return fs.promises
              .unlink(`uploads/posts/${filename}`)
              .catch(() => {});
          }),
        );
      }
      throw error;
    }
  }

  async getPublicPosts(): Promise<IPost[]> {
    const posts = await this.repo.getPublicPosts();
    return posts;
  }

  async getPublicPostsById(id: string): Promise<IPost> {
    const post = await this.repo.getPostById(id);
    if (!post) throw new AppError("post not found", 404);
    if (post.type !== "public") throw new AppError("post is not public", 403);
    return post;
  }

  async deletePostById(postId: string, userId: mongoose.Types.ObjectId) {
    const post = await this.repo.getPostById(postId);
    if (!post) throw new AppError("post not found", 404);
    console.log(post.authorID, userId);
    if (post.authorID.toString() !== userId.toString()) {
      throw new AppError("you are not authorized to delete this post", 403);
    }
    if (post.media && post.media.length > 0) {
      await Promise.all(
        post.media.map((file) => {
          const filename = file.split("/").pop(); // Extract filename from URL
          return fs.promises
            .unlink(`uploads/posts/${filename}`)
            .catch(() => {});
        }),
      );
    }
    const deletedPost = await this.repo.deletePostById(postId);
    if (!deletedPost) throw new AppError("error while deleting post", 500);
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
    // filterQueue.add("check-filter", {
    //   postID: data.postID.toString(),
    //   caption: data.updatedData.caption,
    // });
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
    if (post.media && post.media.length > 0) {
      await Promise.all(
        post.media.map((file) => {
          const filename = file.split("/").pop();
          console.log(filename);
          return fs.promises
            .unlink(`uploads/groups/posts/${filename}`)
            .catch(() => {});
        }),
      );
    }
    const deletedPost = await this.repo.deletePostById(postId);
    if (!deletedPost) throw new AppError("error while deleting post", 500);
    return deletedPost;
  }

  async getUsersPosts(userId: string, page: number, limit: number): Promise<IPost[]> {
    return await this.repo.findPostsByUserId(userId, page, limit) as IPost[];
  }

  async getPostsByIds(postIds: string[]): Promise<IPost[]> {
    return await this.repo.findPostsByIds(postIds);
  }


  async getGroupPosts(
    groupId: string,
    query: string,
  ): Promise<PaginationResult<IPost>> {
    return this.repo.getGroupPosts(groupId, query);
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
