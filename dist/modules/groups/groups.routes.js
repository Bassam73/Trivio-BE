"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_joi_validation_1 = __importDefault(require("express-joi-validation"));
const groups_controller_1 = require("./groups.controller");
const groups_validation_1 = require("./groups.validation");
const upload_1 = require("../../core/utils/upload");
const protectedRoutes_1 = __importDefault(require("../../core/middlewares/protectedRoutes"));
const isGroupMember_1 = require("../../core/middlewares/isGroupMember");
const validator = express_joi_validation_1.default.createValidator();
const groupRouter = express_1.default.Router();
groupRouter
    .route("/")
    .post(protectedRoutes_1.default, validator.body(groups_validation_1.createGroupVal), upload_1.uploadImage.single("logo"), groups_controller_1.createGroup)
    .get(groups_controller_1.getGroups);
groupRouter.route("/feed").get(protectedRoutes_1.default, groups_controller_1.getGroupFeed);
groupRouter
    .route("/:id")
    .delete(protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.deleteGroup)
    .get(validator.params(groups_validation_1.paramsIdVal), groups_controller_1.getGroupById)
    .patch(protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), upload_1.uploadImage.single("logo"), validator.body(groups_validation_1.updateGroupVal), groups_controller_1.updateGroup);
groupRouter
    .route("/:id/join")
    .post(protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.joinGroup);
groupRouter
    .route("/:id/leave")
    .delete(protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.leaveGroup);
groupRouter
    .route("/:id/requests")
    .get(protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.getGroupRequests);
groupRouter
    .route("/:id/requests/cancel")
    .delete(protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.cancelJoinRequest);
groupRouter
    .route("/:id/requests/:requestId/accept")
    .post(protectedRoutes_1.default, validator.params(groups_validation_1.paramsRequestIdVal), groups_controller_1.acceptJoinRequest);
groupRouter
    .route("/:id/requests/:requestId/decline")
    .post(protectedRoutes_1.default, validator.params(groups_validation_1.paramsRequestIdVal), groups_controller_1.declineJoinRequest);
groupRouter.post("/:id/promote", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), validator.body(groups_validation_1.changeMemberRoleVal), groups_controller_1.promoteMember);
groupRouter.post("/:id/demote", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), validator.body(groups_validation_1.changeMemberRoleVal), groups_controller_1.demoteMember);
groupRouter.post("/:id/kick", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), validator.body(groups_validation_1.memberActionVal), groups_controller_1.kickMember);
groupRouter.post("/:id/ban", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), validator.body(groups_validation_1.memberActionVal), groups_controller_1.banMember);
groupRouter.post("/:id/unban", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), validator.body(groups_validation_1.memberActionVal), groups_controller_1.unbanMember);
groupRouter.get("/:id/members", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.getGroupMembers);
groupRouter.get("/:id/admins", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.getGroupAdmins);
groupRouter.get("/:id/moderators", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.getGroupModerators);
groupRouter.get("/:id/banned", protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.getBannedUsers);
groupRouter
    .route("/:id/posts")
    .post(protectedRoutes_1.default, isGroupMember_1.isGroupMember, validator.params(groups_validation_1.paramsIdVal), validator.body(groups_validation_1.createGroupPostVal), upload_1.uploadMedia.fields([{ name: "media", maxCount: 10 }]), groups_controller_1.createGroupPost)
    .get(protectedRoutes_1.default, validator.params(groups_validation_1.paramsIdVal), groups_controller_1.getGroupPosts);
groupRouter
    .route("/:id/posts/:postId")
    .delete(protectedRoutes_1.default, isGroupMember_1.isGroupMember, validator.params(groups_validation_1.paramsGroupPostVal), groups_controller_1.deleteGroupPost)
    .patch(protectedRoutes_1.default, isGroupMember_1.isGroupMember, validator.params(groups_validation_1.paramsGroupPostVal), validator.body(groups_validation_1.updateGroupPostVal), groups_controller_1.updateGroupPost)
    .get(protectedRoutes_1.default, validator.params(groups_validation_1.paramsGroupPostVal), groups_controller_1.getGroupPostById);
exports.default = groupRouter;
