import { Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import GroupService from "./groups.service";
import {
  changeMemberRoleDTO,
  createGroupDTO,
  memberActionDTO,
  updateGroupDTO,
} from "../../types/group.types";
import { checkGroupRole } from "../../core/middlewares/role.middleware"; // Might not use here directly if Service handles it, but maybe for routes?

const service = GroupService.getInstance();

export const createGroup = catchError(async (req: Request, res: Response) => {
  const data: createGroupDTO = req.body;
  data.logo = `${process.env.BASE_URL || "http://localhost:3500"}/uploads/groups/${
    req.file?.filename
  }`;
  console.log(req.user?._id);
  data.creatorId = req.user?._id as string;
  const group = await service.createGroup(data);
  res.status(201).json({
    status: "success",
    data: {
      group,
    },
  });
});

export const getGroupById = catchError(async (req: Request, res: Response) => {
  const group = await service.getGroupById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      group,
    },
  });
});
export const deleteGroup = catchError(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userID = req.user?._id as string;
  console.log(userID);
  await service.deleteGroup(postId, userID);
  res.status(204).send();
});

export const updateGroup = catchError(async (req: Request, res: Response) => {
  const data: updateGroupDTO = {
    data: req.body,
    postId: req.params.id,
    userID: req.user?._id as string,
  };
  if (req.file) {
    data.data.logo = `${
      process.env.BASE_URL || "http://localhost:3500"
    }/uploads/groups/${req.file.filename}`;
  }
  const group = await service.updateGroupById(data);
  res.status(200).json({
    status: "success",
    data: {
      group,
    },
  });
});

export const getGroups = catchError(async (req: Request, res: Response) => {
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


export const joinGroup = catchError(async (req: Request, res: Response) => {
  const result = await service.joinGroup(req.params.id, req.user?._id as string);
  res.status(200).json({ status: "success", message: result });
});

export const leaveGroup = catchError(async (req: Request, res: Response) => {
  await service.leaveGroup(req.params.id, req.user?._id as string);
  res.status(200).json({ status: "success", message: "Left group successfully" });
});

export const getGroupRequests = catchError(async (req: Request, res: Response) => {
  const { data, page } = await service.getGroupRequests(req.params.id, req.user?._id as string, req.query);
  res.status(200).json({ status: "success", data: { data, page } });
});

export const acceptJoinRequest = catchError(async (req: Request, res: Response) => {
  await service.acceptJoinRequest(req.params.id, req.user?._id as string, req.params.requestId);
  res.status(200).json({ status: "success", message: "Request accepted" });
});

export const declineJoinRequest = catchError(async (req: Request, res: Response) => {
  await service.declineJoinRequest(req.params.id, req.user?._id as string, req.params.requestId);
  res.status(200).json({ status: "success", message: "Request declined" });
});
export const cancelJoinRequest = catchError(async (req: Request, res: Response) => {
  await service.cancelJoinRequest(req.params.id, req.user?._id as string);
  res.status(200).json({ status: "success", message: "Request cancelled" });
});

export const promoteMember = catchError(async (req: Request, res: Response) => {
  const { newRole, targetUserId } = req.body;
  await service.promoteMember({ groupId: req.params.id, targetUserId, newRole }, req.user?._id as string);
  res.status(200).json({ status: "success", message: "Member promoted successfully" });
});

export const demoteMember = catchError(async (req: Request, res: Response) => {
  const { newRole, targetUserId } = req.body;
  await service.demoteMember({ groupId: req.params.id, targetUserId, newRole }, req.user?._id as string);
  res.status(200).json({ status: "success", message: "Member demoted successfully" });
});

export const kickMember = catchError(async (req: Request, res: Response) => {
    const { targetUserId } = req.body;
    await service.kickMember({ groupId: req.params.id, targetUserId }, req.user?._id as string);
    res.status(200).json({ status: "success", message: "Member kicked successfully" });
});

export const banMember = catchError(async (req: Request, res: Response) => {
    const { targetUserId } = req.body;
    await service.banMember({ groupId: req.params.id, targetUserId }, req.user?._id as string);
    res.status(200).json({ status: "success", message: "Member banned successfully" });
});

export const unbanMember = catchError(async (req: Request, res: Response) => {
    const { targetUserId } = req.body;
    await service.unbanMember({ groupId: req.params.id, targetUserId }, req.user?._id as string);
    res.status(200).json({ status: "success", message: "Member unbanned successfully" });
});

export const getBannedUsers = catchError(async (req: Request, res: Response) => {
    const { data, page } = await service.getBannedUsers(req.params.id, req.user?._id as string, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});

export const getGroupMembers = catchError(async (req: Request, res: Response) => {
    const { data, page } = await service.getGroupMembers(req.params.id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});

export const getGroupAdmins = catchError(async (req: Request, res: Response) => {
    const { data, page } = await service.getGroupAdmins(req.params.id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});

export const getGroupModerators = catchError(async (req: Request, res: Response) => {
    const { data, page } = await service.getGroupModerators(req.params.id, req.query);
    res.status(200).json({ status: "success", data: { data, page } });
});
