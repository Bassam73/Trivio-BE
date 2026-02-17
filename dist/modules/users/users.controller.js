"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestUsers = exports.changePassword = exports.removeFavPlayer = exports.removeFavTeam = exports.getFavPlayers = exports.getFavTeams = exports.getSavedPosts = exports.togglePrivacy = exports.updateProfile = exports.getUserPosts = exports.getLikedPosts = exports.getLikePostsID = exports.getMe = exports.getMyFollowing = exports.getMyFollowers = exports.getRelationshipStatus = exports.getFollowing = exports.getFollowers = exports.unFollowUser = exports.followUser = void 0;
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
// not yet agreed whether the account would have a privacy setting or not
exports.togglePrivacy = (0, catchError_1.default)(async (req, res) => {
    // const id = req.user?._id as string;
    // await service.togglePrivacy(id);
    // res.status(200).json({ status: "success" });
});
exports.getSavedPosts = (0, catchError_1.default)(async (req, res) => {
    // to be implemented in the future
});
exports.getFavTeams = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    // const user = await service.getMe(id);
    const teams = await service.getFavTeams(id);
    res.status(200).json({ status: "success", data: { teams } });
});
exports.getFavPlayers = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const players = await service.getFavPlayers(id);
    res.status(200).json({ status: "success", data: { players } });
});
exports.removeFavTeam = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const teamsToRemove = req.body.teams || [];
    console.log(teamsToRemove);
    const updatedUser = await service.removeTeam(id, teamsToRemove);
    res.status(200).json({ status: "success", data: { user: updatedUser } });
});
exports.removeFavPlayer = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const playersToRemove = req.body.players || [];
    const updatedUser = await service.removePlayer(id, playersToRemove);
    res.status(200).json({ status: "success", data: { user: updatedUser } });
});
exports.changePassword = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const { currentPassword, newPassword } = req.body;
    await service.changePassword(id, currentPassword, newPassword);
    res.status(200).json({ status: "success" });
});
//suggest users to follow based on shared interests (fav teams and players)
exports.suggestUsers = (0, catchError_1.default)(async (req, res) => {
    const id = req.user?._id;
    const limit = Number(req.query.limit) || 10;
    const suggestions = await service.suggestUsers(id, limit);
    res.status(200).json({ status: "success", data: { suggestions } });
});
//2- update email in another route to handle the email verification process
//5-  get liked posts --> wait for the reaction module to be implemented to return the post ids
//--------------------------------------------------
//not yet agreed on the method of implementation:
//1- block user??
//2- unblock user??
//---------------------------------------------------
//18- get feed --> recommender system
