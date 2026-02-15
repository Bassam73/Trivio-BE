"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostById = exports.deletePostById = exports.getPublicPostsById = exports.getPublicPosts = exports.createPost = void 0;
const catchError_1 = __importDefault(require("../../core/middlewares/catchError"));
const posts_service_1 = __importDefault(require("./posts.service"));
const mongoose_1 = __importDefault(require("mongoose"));
const service = posts_service_1.default.getInstace();
const getPublicPosts = (0, catchError_1.default)(async (req, res, next) => {
    const posts = await service.getPublicPosts();
    res.status(200).json({ status: "success", data: { posts } });
});
exports.getPublicPosts = getPublicPosts;
const createPost = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    const files = req.files;
    if (files?.media && files.media.length > 0) {
        console.log("we are in files");
        data.media = files.media.map((media) => `${process.env.BASE_URL || "http://localhost:3500"}/uploads/posts/${media.filename}`);
    }
    data.authorID = req.user?.id;
    const post = await service.createPost(data);
    res.status(201).json({ status: "success", data: { post } });
});
exports.createPost = createPost;
const getPublicPostsById = (0, catchError_1.default)(async (req, res, next) => {
    const post = await service.getPublicPostsById(req.params.id);
    res.status(200).json({ status: "success", data: { post } });
});
exports.getPublicPostsById = getPublicPostsById;
const deletePostById = (0, catchError_1.default)(async (req, res, next) => {
    await service.deletePostById(req.params.id, req.user?.id);
    res.status(204).send();
});
exports.deletePostById = deletePostById;
const updatePostById = (0, catchError_1.default)(async (req, res, next) => {
    const data = {
        updatedData: req.body,
        postID: new mongoose_1.default.Types.ObjectId(req.params.id),
        userID: req.user?.id,
    };
    const post = await service.updatePostById(data);
    res.status(200).json({ status: "success", data: { post } });
});
exports.updatePostById = updatePostById;
