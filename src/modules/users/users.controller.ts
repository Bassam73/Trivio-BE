import { Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import UsersService from "./users.service";

const service = UsersService.getInstance();
export const followUser = catchError(async (req: Request, res: Response) => {
  let userID: string = req.params.id;
  let followerID: string = req.user?._id as string;
  const follow = await service.followUser(userID, followerID);
  res.status(201).json({ status: "success", data: { follow } });
});

export const unFollowUser = catchError(async (req: Request, res: Response) => {
  let userID: string = req.params.id;
  let followerID: string = req.user?._id as string;
  await service.unFollowUser(userID, followerID);
  res.status(204).send();
});

export const getFollowers = catchError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const followers = await service.getFollowers(id, page, limit);
  res.status(200).json({ status: "success", data: { followers } });
});

export const getFollowing = catchError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const following = await service.getFollowing(id, page, limit);
  res.status(200).json({ status: "success", data: { following } });
});

export const getRelationshipStatus = catchError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user?._id as string;
  const status = await service.getRelationshipStatus(id, currentUserId);
  res.status(200).json({ status: "success", data: { status } });
});
