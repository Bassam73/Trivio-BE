"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../core/utils/AppError"));
const post_types_1 = require("../../types/post.types");
const auth_repo_1 = __importDefault(require("../auth/auth.repo"));
const posts_repo_1 = __importDefault(require("./posts.repo"));
const fs_1 = __importDefault(require("fs"));
const mentionedUsers_1 = __importDefault(require("../../core/utils/mentionedUsers"));
class PostService {
    constructor(repo, userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }
    async checkToxicity(flag, id) {
        if (flag == post_types_1.ToxicityFlags.blocked) {
            await this.repo.deletePostById(id);
            return;
        }
        if (flag == post_types_1.ToxicityFlags.flagged) {
            await this.repo.updatePostById(id, { flagged: true });
            return;
        }
    }
    async createPost(data) {
        console.time("Total Logic Time");
        try {
            if (data.caption) {
                const caption = data.caption;
                console.time("Mentions ");
                const mentions = await (0, mentionedUsers_1.default)(caption);
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
        }
        catch (error) {
            if (data.media && data.media.length > 0) {
                await Promise.all(data.media.map((media) => {
                    const filename = media.split("/").pop(); // Extract filename from URL
                    return fs_1.default.promises
                        .unlink(`uploads/posts/${filename}`)
                        .catch(() => { });
                }));
            }
            throw error;
        }
    }
    async getPublicPosts() {
        const posts = await this.repo.getPublicPosts();
        return posts;
    }
    async getPublicPostsById(id) {
        const post = await this.repo.getPostById(id);
        if (!post)
            throw new AppError_1.default("post not found", 404);
        if (post.type !== "public")
            throw new AppError_1.default("post is not public", 403);
        return post;
    }
    async deletePostById(postId, userId) {
        const post = await this.repo.getPostById(postId);
        if (!post)
            throw new AppError_1.default("post not found", 404);
        console.log(post.authorID, userId);
        if (post.authorID.toString() !== userId.toString()) {
            throw new AppError_1.default("you are not authorized to delete this post", 403);
        }
        if (post.media && post.media.length > 0) {
            await Promise.all(post.media.map((file) => {
                const filename = file.split("/").pop(); // Extract filename from URL
                return fs_1.default.promises
                    .unlink(`uploads/posts/${filename}`)
                    .catch(() => { });
            }));
        }
        const deletedPost = await this.repo.deletePostById(postId);
        if (!deletedPost)
            throw new AppError_1.default("error while deleting post", 500);
    }
    async updatePostById(data) {
        const post = await this.repo.getPostById(data.postID.toString());
        if (!post)
            throw new AppError_1.default("post not found", 404);
        if (post.authorID.toString() !== data.userID.toString()) {
            throw new AppError_1.default("you are not authorized to update this post", 403);
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
        const updates = {
            caption: data.updatedData.caption,
            type: data.updatedData.type,
            mentions: await (0, mentionedUsers_1.default)(data.updatedData.caption),
            flagged: false,
        };
        const updatedPost = await this.repo.updatePostById(data.postID.toString(), updates);
        return updatedPost;
    }
    async deleteGroupPost(postId) {
        const post = await this.repo.getPostById(postId);
        if (!post)
            throw new AppError_1.default("post not found", 404);
        if (post.media && post.media.length > 0) {
            await Promise.all(post.media.map((file) => {
                const filename = file.split("/").pop();
                console.log(filename);
                return fs_1.default.promises
                    .unlink(`uploads/groups/posts/${filename}`)
                    .catch(() => { });
            }));
        }
        const deletedPost = await this.repo.deletePostById(postId);
        if (!deletedPost)
            throw new AppError_1.default("error while deleting post", 500);
        return deletedPost;
    }
    async getUsersPosts(userId, page, limit) {
        return await this.repo.findPostsByUserId(userId, page, limit);
    }
    async getPostsByIds(postIds) {
        return await this.repo.findPostsByIds(postIds);
    }
    async getGroupPosts(groupId, query) {
        return this.repo.getGroupPosts(groupId, query);
    }
    static getInstace() {
        if (!PostService.instance) {
            PostService.instance = new PostService(posts_repo_1.default.getInstace(), auth_repo_1.default.getInstance());
        }
        return PostService.instance;
    }
}
exports.default = PostService;
