"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFavPlayers = exports.updateFavTeams = exports.getFavPlayers = exports.getFavTeams = exports.getSavedPosts = exports.togglePrivacy = exports.updateProfile = exports.getUserPosts = exports.getLikedPosts = exports.getLikePostsID = exports.getMe = exports.getMyFollowing = exports.getMyFollowers = exports.getRelationshipStatus = exports.getFollowing = exports.getFollowers = exports.unFollowUser = exports.followUser = void 0;
const catchError_1 = __importDefault(require("../../core/middlewares/catchError"));
const users_service_1 = __importDefault(require("./users.service"));
const service = users_service_1.default.getInstance();
exports.followUser = (0, catchError_1.default)(async (req, res) => {
    let userID = req.params.id;
    let followerID = req.user?._id;
    const follow = await service.followUser(userID, followerID);
    res.status(201).json({ status: "success", data: { follow } });
});
exports.unFollowUser = (0, catchError_1.default)(async (req, res) => {
    let userID = req.params.id;
    let followerID = req.user?._id;
    await service.unFollowUser(userID, followerID);
    res.status(204).send();
});
exports.getFollowers = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const followers = await service.getFollowers(id, page, limit);
    res.status(200).json({ status: "success", data: { followers } });
});
exports.getFollowing = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const following = await service.getFollowing(id, page, limit);
    res.status(200).json({ status: "success", data: { following } });
});
exports.getRelationshipStatus = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user?._id;
    const status = await service.getRelationshipStatus(id, currentUserId);
    res.status(200).json({ status: "success", data: { status } });
});
exports.getMyFollowers = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const followers = await service.getFollowers(id, page, limit);
    res.status(200).json({ status: "success", data: { followers } });
});
exports.getMyFollowing = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const following = await service.getFollowing(id, page, limit);
    res.status(200).json({ status: "success", data: { following } });
});
exports.getMe = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const user = await service.getMe(id);
    res.status(200).json({ status: "success", data: { user } });
});
exports.getLikePostsID = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const likedPosts = await service.getLikedPosts(id, page, limit);
    res.status(200).json({ status: "success", data: { likedPosts } });
});
exports.getLikedPosts = (0, catchError_1.default)(async (req, res) => {
    const { postIds } = req.body;
    const posts = await service.getBulkLikedPosts(postIds);
    res.status(200).json({ status: "success", data: { posts } });
});
exports.getUserPosts = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    await service.getMe(id);
    const posts = await service.getUserPosts(id, page, limit);
    res.status(200).json({ status: "success", data: { posts } });
});
exports.updateProfile = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    console.log(id);
    console.log(req.body);
    const data = req.body || {};
    console.log(data);
    const files = req.files;
    if (files?.avatar && files.avatar.length == 1) {
        data.avatar = `${process.env.BASE_URL || "http://localhost:3500"}/uploads/avatars/${files.avatar[0].filename}`;
    }
    const updatedUser = await service.updateProfile(id, data);
    res.status(200).json({ status: "success", data: { user: updatedUser } });
});
exports.togglePrivacy = (0, catchError_1.default)(async (req, res) => {
});
exports.getSavedPosts = (0, catchError_1.default)(async (req, res) => {
    // to be implemented in the future
});
exports.getFavTeams = (0, catchError_1.default)(async (req, res) => {
    // to be implemented in the future
});
exports.getFavPlayers = (0, catchError_1.default)(async (req, res) => {
    // to be implemented in the future
});
exports.updateFavTeams = (0, catchError_1.default)(async (req, res) => {
    // to be implemented in the future
});
exports.updateFavPlayers = (0, catchError_1.default)(async (req, res) => {
    // to be implemented in the future
});
//1- update me (user name , bio, avatar) in another route in case we want to
// add more fields in the future and to avoid making the update user route too big and
// to avoid making the user update route with many optional fields that can be updated
//2- update email in another route to handle the email verification process
//3- update password in another route to handle the password validation and hashing process
//4- toggle privacy in another route to handle the privacy validation
// and the follow requests when changing from public to private
//5-  get liked posts --> wait for the reaction module to be implemented to return the post ids
//6-  get saved posts??
//7-  get user posts with pagination(shared or posted) in profile
//13- upload avatar
//15- block user??
//16- unblock user??
//17- get blocked users??
//18- get feed --> recommender system
//19- suggest users to follow 
