"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupFeed = exports.getGroupPostById = exports.getGroupPosts = exports.updateGroupPost = exports.deleteGroupPost = exports.createGroupPost = exports.getGroupModerators = exports.getGroupAdmins = exports.getGroupMembers = exports.getBannedUsers = exports.unbanMember = exports.banMember = exports.kickMember = exports.demoteMember = exports.promoteMember = exports.cancelJoinRequest = exports.declineJoinRequest = exports.acceptJoinRequest = exports.getGroupRequests = exports.leaveGroup = exports.joinGroup = exports.getGroups = exports.updateGroup = exports.deleteGroup = exports.getGroupById = exports.createGroup = void 0;
const catchError_1 = __importDefault(require("../../core/middlewares/catchError"));
const groups_service_1 = __importDefault(require("./groups.service"));
const service = groups_service_1.default.getInstance();
exports.createGroup = (0, catchError_1.default)(async (req, res) => {
    const data = req.body;
    data.logo = `${process.env.BASE_URL || "http://localhost:3500"}/uploads/groups/${req.file?.filename}`;
    console.log(req.user?._id);
    data.creatorId = req.user?._id;
    const group = await service.createGroup(data);
    res.status(201).json({
        status: "success",
        data: {
            group,
        },
    });
});
exports.getGroupById = (0, catchError_1.default)(async (req, res) => {
    const group = await service.getGroupById(req.params.id);
    res.status(200).json({
        status: "success",
        data: {
            group,
        },
    });
});
exports.deleteGroup = (0, catchError_1.default)(async (req, res) => {
    const postId = req.params.id;
    const userID = req.user?._id;
    console.log(userID);
    await service.deleteGroup(postId, userID);
    res.status(204).send();
});
exports.updateGroup = (0, catchError_1.default)(async (req, res) => {
    const data = {
        data: req.body,
        postId: req.params.id,
        userID: req.user?._id,
    };
    if (req.file) {
        data.data.logo = `${process.env.BASE_URL || "http://localhost:3500"}/uploads/groups/${req.file.filename}`;
    }
    const group = await service.updateGroupById(data);
    res.status(200).json({
        status: "success",
        data: {
            group,
        },
    });
});
exports.getGroups = (0, catchError_1.default)(async (req, res) => {
    console.log(req.query);
    const { data, page } = await service.getGroups(req.query);
    res.status(200).json({
        status: "success",
        data: {
            data,
            page,
        },
    });
});
exports.joinGroup = (0, catchError_1.default)(async (req, res) => {
    const result = await service.joinGroup(req.params.id, req.user?._id);
    res.status(200).json({ status: "success", message: result });
});
exports.leaveGroup = (0, catchError_1.default)(async (req, res) => {
    await service.leaveGroup(req.params.id, req.user?._id);
    res
        .status(200)
        .json({ status: "success", message: "Left group successfully" });
});
exports.getGroupRequests = (0, catchError_1.default)(async (req, res) => {
    const { data, page } = await service.getGroupRequests(req.params.id, req.user?._id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});
exports.acceptJoinRequest = (0, catchError_1.default)(async (req, res) => {
    await service.acceptJoinRequest(req.params.id, req.user?._id, req.params.requestId);
    res.status(200).json({ status: "success", message: "Request accepted" });
});
exports.declineJoinRequest = (0, catchError_1.default)(async (req, res) => {
    await service.declineJoinRequest(req.params.id, req.user?._id, req.params.requestId);
    res.status(200).json({ status: "success", message: "Request declined" });
});
exports.cancelJoinRequest = (0, catchError_1.default)(async (req, res) => {
    await service.cancelJoinRequest(req.params.id, req.user?._id);
    res.status(200).json({ status: "success", message: "Request cancelled" });
});
exports.promoteMember = (0, catchError_1.default)(async (req, res) => {
    const { newRole, targetUserId } = req.body;
    await service.promoteMember({ groupId: req.params.id, targetUserId, newRole }, req.user?._id);
    res
        .status(200)
        .json({ status: "success", message: "Member promoted successfully" });
});
exports.demoteMember = (0, catchError_1.default)(async (req, res) => {
    const { newRole, targetUserId } = req.body;
    await service.demoteMember({ groupId: req.params.id, targetUserId, newRole }, req.user?._id);
    res
        .status(200)
        .json({ status: "success", message: "Member demoted successfully" });
});
exports.kickMember = (0, catchError_1.default)(async (req, res) => {
    const { targetUserId } = req.body;
    await service.kickMember({ groupId: req.params.id, targetUserId }, req.user?._id);
    res
        .status(200)
        .json({ status: "success", message: "Member kicked successfully" });
});
exports.banMember = (0, catchError_1.default)(async (req, res) => {
    const { targetUserId } = req.body;
    await service.banMember({ groupId: req.params.id, targetUserId }, req.user?._id);
    res
        .status(200)
        .json({ status: "success", message: "Member banned successfully" });
});
exports.unbanMember = (0, catchError_1.default)(async (req, res) => {
    const { targetUserId } = req.body;
    await service.unbanMember({ groupId: req.params.id, targetUserId }, req.user?._id);
    res
        .status(200)
        .json({ status: "success", message: "Member unbanned successfully" });
});
exports.getBannedUsers = (0, catchError_1.default)(async (req, res) => {
    const { data, page } = await service.getBannedUsers(req.params.id, req.user?._id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});
exports.getGroupMembers = (0, catchError_1.default)(async (req, res) => {
    const { data, page } = await service.getGroupMembers(req.params.id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});
exports.getGroupAdmins = (0, catchError_1.default)(async (req, res) => {
    const { data, page } = await service.getGroupAdmins(req.params.id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});
exports.getGroupModerators = (0, catchError_1.default)(async (req, res) => {
    const { data, page } = await service.getGroupModerators(req.params.id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});
exports.createGroupPost = (0, catchError_1.default)(async (req, res) => {
    const data = req.body;
    data.authorID = req.user?._id;
    data.groupID = req.params.id;
    data.location = "group";
    const files = req.files;
    if (files?.media && files.media.length > 0) {
        data.media = files.media.map((media) => `${process.env.BASE_URL || "http://localhost:3500"}/uploads/groups/posts/${media.filename}`);
    }
    const post = await service.createGroupPost(data);
    res.status(201).json({ status: "success", data: { post } });
});
exports.deleteGroupPost = (0, catchError_1.default)(async (req, res) => {
    await service.deleteGroupPost(req.params.id, req.params.postId, req.user?._id);
    res
        .status(200)
        .json({ status: "success", message: "Post deleted successfully" });
});
exports.updateGroupPost = (0, catchError_1.default)(async (req, res) => {
    const data = {
        updatedData: {
            caption: req.body.caption,
        },
        postID: req.params.postId,
        userID: req.user?._id,
    };
    const post = await service.updateGroupPost(data);
    res.status(200).json({ status: "success", data: { post } });
});
exports.getGroupPosts = (0, catchError_1.default)(async (req, res) => {
    const { data, page } = await service.getGroupPosts(req.params.id, req.user?._id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});
exports.getGroupPostById = (0, catchError_1.default)(async (req, res) => {
    const post = await service.getGroupPostById(req.params.id, req.user?._id, req.params.postId);
    res.status(200).json({ status: "success", data: { post } });
});
exports.getGroupFeed = (0, catchError_1.default)(async (req, res) => {
    const posts = await service.getGroupFeed(req.user?.id);
    res.status(200).json({ status: "success", data: { posts } });
});
