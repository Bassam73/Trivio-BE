import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import catchError from "./catchError";
import groupMemberModel from "../../database/models/groupMember.model";
import { GroupRole } from "../../types/group.types";

export const checkGroupRole = (roles: GroupRole[]) => {
  return catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const userId = (req as any).user._id;

    if (!groupId) {
        return next(new AppError("Group ID is required", 400));
    }

    const member = await groupMemberModel.findOne({ groupId, userId });

    if (!member) {
      return next(new AppError("You are not a member of this group", 403));
    }

    if (member.status === "banned") {
        return next(new AppError("You are banned from this group", 403));
    }

    if (!roles.includes(member.role)) {
      return next(new AppError(`Access denied. Allowed roles: ${roles.join(", ")}`, 403));
    }

    // Attach member to request for future use if needed
    // (req as any).groupMember = member;

    next();
  });
};
