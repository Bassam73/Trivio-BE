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

export default class PostService {
  private static instance: PostService;
  private repo: PostRepository;
  private userRepo: AuthRepository;
  constructor(repo: PostRepository, userRepo: AuthRepository) {
    this.repo = repo;
    this.userRepo = userRepo;
  }
  async checkToxicity(caption: string): Promise<ToxicityFlags> {
    let result: ToxicityFlags;
    const response = await axios.post(
      process.env.TOXICITY_MODEL_URL as string,
      { text: caption }
    );
    const dataString = JSON.stringify(response.data);
    if (dataString.includes("Safe")) result = ToxicityFlags.safe;
    else if (dataString.includes("BLOCKED")) result = ToxicityFlags.blocked;
    else result = ToxicityFlags.flagged;

    return result;
  }
  async createPost(data: createPostDTO) {
    console.time("Total Logic Time");
    try {
      if (data.caption) {
        const caption: string = data.caption;

        console.time("Mentions ");
        const mentions: IUser[] | null = await getMentionedUsers(caption);
        console.timeEnd("Mentions ");

        console.time("Toxicity Check");
        const filter: ToxicityFlags = await this.checkToxicity(caption);
        console.timeEnd("Toxicity Check");

        if (filter == ToxicityFlags.blocked)
          throw new AppError("the post is blocked because of its content", 400);

        if (filter == ToxicityFlags.flagged) data.flagged = true;

        if (mentions) {
          data.mentions = mentions;
        }
      }
      data.location = "profile";
      console.time("DB Save");
      const post = await this.repo.createPost(data);
      console.timeEnd("DB Save");
      console.timeEnd("Total Logic Time");

      return post;
    } catch (error) {
      if (data.media && data.media.length > 0) {
        await Promise.all(
          data.media.map((media) =>
            fs.promises.unlink(`uploads/posts/${media}`).catch(() => {})
          )
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
        post.media.map((file) =>
          fs.promises.unlink(`uploads/posts/${file}`).catch(() => {})
        )
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
    const filter = await this.checkToxicity(data.updatedData.caption);

    if (filter == ToxicityFlags.blocked)
      throw new AppError(
        "the updated post is blocked because of its content",
        400
      );

    const updates: any = {
      caption: data.updatedData.caption,
      type: data.updatedData.type,
      mentions: await getMentionedUsers(data.updatedData.caption),
      flagged: filter == ToxicityFlags.flagged,
    };
    return await this.repo.updatePostById(data.postID.toString(), updates);
  }
  static getInstace() {
    if (!PostService.instance) {
      PostService.instance = new PostService(
        PostRepository.getInstace(),
        AuthRepository.getInstance()
      );
    }
    return PostService.instance;
  }
}
