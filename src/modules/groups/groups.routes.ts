import express from "express";
import valid from "express-joi-validation";
import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroups,
  updateGroup,
  joinGroup,
  leaveGroup,
  getGroupRequests,
  acceptJoinRequest,
  declineJoinRequest,
  cancelJoinRequest,
  promoteMember,
  demoteMember,
  kickMember,
  banMember,
  unbanMember,
  getBannedUsers,
  getGroupMembers,
  getGroupAdmins,
  getGroupModerators,
  createGroupPost,
  deleteGroupPost,
  updateGroupPost,
  getGroupPosts,
  getGroupPostById,
  getGroupFeed,
} from "./groups.controller";
import {
  createGroupVal,
  paramsIdVal,
  updateGroupVal,
  paramsRequestIdVal,
  changeMemberRoleVal,
  memberActionVal,
  createGroupPostVal,
  updateGroupPostVal,
  paramsGroupPostVal,
} from "./groups.validation";
import { uploadImage, uploadMedia } from "../../core/utils/upload";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import { isGroupMember } from "../../core/middlewares/isGroupMember";

const validator = valid.createValidator();
const groupRouter = express.Router();

groupRouter
  .route("/")
  .post(
    protectedRoutes,
    validator.body(createGroupVal),
    uploadImage.single("logo"),
    createGroup,
  )
  .get(getGroups);
groupRouter.route("/feed").get(protectedRoutes, getGroupFeed);
groupRouter
  .route("/:id")
  .delete(protectedRoutes, validator.params(paramsIdVal), deleteGroup)
  .get(validator.params(paramsIdVal), getGroupById)
  .patch(
    protectedRoutes,
    validator.params(paramsIdVal),
    uploadImage.single("logo"),
    validator.body(updateGroupVal),
    updateGroup,
  );

groupRouter
  .route("/:id/join")
  .post(protectedRoutes, validator.params(paramsIdVal), joinGroup);

groupRouter
  .route("/:id/leave")
  .delete(protectedRoutes, validator.params(paramsIdVal), leaveGroup);

groupRouter
  .route("/:id/requests")
  .get(protectedRoutes, validator.params(paramsIdVal), getGroupRequests);

groupRouter
  .route("/:id/requests/cancel")
  .delete(protectedRoutes, validator.params(paramsIdVal), cancelJoinRequest);

groupRouter
  .route("/:id/requests/:requestId/accept")
  .post(
    protectedRoutes,
    validator.params(paramsRequestIdVal),
    acceptJoinRequest,
  );

groupRouter
  .route("/:id/requests/:requestId/decline")
  .post(
    protectedRoutes,
    validator.params(paramsRequestIdVal),
    declineJoinRequest,
  );

groupRouter.post(
  "/:id/promote",
  protectedRoutes,
  validator.params(paramsIdVal),
  validator.body(changeMemberRoleVal),
  promoteMember,
);
groupRouter.post(
  "/:id/demote",
  protectedRoutes,
  validator.params(paramsIdVal),
  validator.body(changeMemberRoleVal),
  demoteMember,
);
groupRouter.post(
  "/:id/kick",
  protectedRoutes,
  validator.params(paramsIdVal),
  validator.body(memberActionVal),
  kickMember,
);
groupRouter.post(
  "/:id/ban",
  protectedRoutes,
  validator.params(paramsIdVal),
  validator.body(memberActionVal),
  banMember,
);
groupRouter.post(
  "/:id/unban",
  protectedRoutes,
  validator.params(paramsIdVal),
  validator.body(memberActionVal),
  unbanMember,
);

groupRouter.get(
  "/:id/members",
  protectedRoutes,
  validator.params(paramsIdVal),
  getGroupMembers,
);
groupRouter.get(
  "/:id/admins",
  protectedRoutes,
  validator.params(paramsIdVal),
  getGroupAdmins,
);
groupRouter.get(
  "/:id/moderators",
  protectedRoutes,
  validator.params(paramsIdVal),
  getGroupModerators,
);
groupRouter.get(
  "/:id/banned",
  protectedRoutes,
  validator.params(paramsIdVal),
  getBannedUsers,
);
groupRouter
  .route("/:id/posts")
  .post(
    protectedRoutes,
    isGroupMember,
    validator.params(paramsIdVal),
    validator.body(createGroupPostVal),
    uploadMedia.fields([{ name: "media", maxCount: 10 }]),
    createGroupPost,
  )
  .get(protectedRoutes, validator.params(paramsIdVal), getGroupPosts);
groupRouter
  .route("/:id/posts/:postId")
  .delete(
    protectedRoutes,
    isGroupMember,
    validator.params(paramsGroupPostVal),
    deleteGroupPost,
  )
  .patch(
    protectedRoutes,
    isGroupMember,
    validator.params(paramsGroupPostVal),
    validator.body(updateGroupPostVal),
    updateGroupPost,
  )
  .get(protectedRoutes, validator.params(paramsGroupPostVal), getGroupPostById);
export default groupRouter;
