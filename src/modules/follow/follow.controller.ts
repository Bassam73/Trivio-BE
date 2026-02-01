import { Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import FollowService from "./follow.service";
import { UserPrivacy } from "../../types/user.types";

const service = FollowService.getInstance();

export const getFollowRequests = catchError(
  async (req: Request, res: Response) => {
    const requests = await service.getFollowRequests(
      req.user?._id as string,
      req.user?.privacy as UserPrivacy,
    );
    res.status(200).json({ status: "success", data: { requests } });
  },
);

export const acceptFollowRequest = catchError(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const currentUserId = req.user?._id as string;
    const follow = await service.acceptFollowRequest(requestId, currentUserId);
    res.status(200).json({ status: "success", data: { follow } });
  },
);

export const declineFollowRequest = catchError(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const currentUserId = req.user?._id as string;
    await service.declineFollowRequest(requestId, currentUserId);
    res.status(204).send();
  },
);
