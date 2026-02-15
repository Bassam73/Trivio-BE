"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiFeatures_1 = __importDefault(require("../../core/utils/ApiFeatures"));
const post_model_1 = __importDefault(require("../../database/models/post.model"));
class PostRepository {
    constructor() { }
    async createPost(data) {
        return await post_model_1.default.create(data);
    }
    async getPublicPosts() {
        return await post_model_1.default.find({ type: "public" });
    }
    async getPostById(id) {
        return await post_model_1.default.findById(id);
    }
    async deletePostById(id) {
        return await post_model_1.default.findByIdAndDelete(id);
    }
    async updatePostById(id, data) {
        return await post_model_1.default.findByIdAndUpdate(id, data, { new: true });
    }
    async getGroupPosts(groupId, searchQuery) {
        const apiFeatures = new ApiFeatures_1.default(post_model_1.default.find({ location: "group", groupID: groupId }), searchQuery)
            .filter()
            .search()
            .sort()
            .fields()
            .pagination(10);
        const reuslt = {
            data: await apiFeatures.getQuery(),
            page: apiFeatures.getPageNumber(),
        };
        return reuslt;
    }
    async findPostsByIds(postIds) {
        return await post_model_1.default.find({
            _id: { $in: postIds }
        });
    }
    async findPostsByUserId(userId, page, limit) {
        return await post_model_1.default.find({
            authorID: userId,
            location: "profile"
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
            path: "authorID",
            select: "username avatar"
        })
            .populate({
            path: "sharedFrom",
            populate: { path: "authorID", select: "username avatar" }
        })
            .exec();
    }
    static getInstace() {
        if (!PostRepository.instance) {
            PostRepository.instance = new PostRepository();
        }
        return PostRepository.instance;
    }
}
exports.default = PostRepository;
