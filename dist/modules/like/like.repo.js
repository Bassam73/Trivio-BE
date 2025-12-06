"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const like_model_1 = __importDefault(require("../../database/models/like.model"));
const post_model_1 = __importDefault(require("../../database/models/post.model"));
const comment_model_1 = __importDefault(require("../../database/models/comment.model"));
class LikeRepo {
    constructor() { }
    async createLike(data) {
        return await like_model_1.default.create(data);
    }
    async findLike(data) {
        const query = { user: data.user };
        if (data.postId)
            query.postId = data.postId;
        if (data.commentId)
            query.commentId = data.commentId;
        return await like_model_1.default.findOne(query);
    }
    async findLikeById(id) {
        return await like_model_1.default.findById(id);
    }
    async updateLike(id, data) {
        return await like_model_1.default.findByIdAndUpdate(id, data, { new: true });
    }
    async updateComment(id, data) {
        return await comment_model_1.default.findByIdAndUpdate(id, data, { new: true });
    }
    async updatePost(id, data) {
        return await post_model_1.default.findByIdAndUpdate(id, data, { new: true });
    }
    async deleteLike(id) {
        return await like_model_1.default.deleteOne({ _id: id });
    }
    async incPostReaction(postId, type, amount) {
        return post_model_1.default.updateOne({ _id: postId }, { $inc: { [`reactionCounts.${type}`]: amount } });
    }
    async incCommentReaction(commentId, type, amount) {
        return comment_model_1.default.updateOne({ _id: commentId }, { $inc: { [`reactionCounts.${type}`]: amount } });
    }
    async findPost(postId) {
        return await post_model_1.default.findById(postId);
    }
    async findComment(commentId) {
        return await comment_model_1.default.findById(commentId);
    }
    static getInstance() {
        if (!LikeRepo.instance)
            LikeRepo.instance = new LikeRepo();
        return LikeRepo.instance;
    }
}
exports.default = LikeRepo;
