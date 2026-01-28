import { NextFunction, Request, Response } from "express";
import GroupRepository from "../../modules/groups/groups.repo";
import AppError from "../utils/AppError";

export const isGroupMember = async (req: Request, res: Response, next: NextFunction) => {
    const groupId = req.params.id;
    const userId = req.user?.id;
    const group = await GroupRepository.getInstance().getGroupById(groupId);
    if (!group) throw new AppError("group not found", 404);
   const status = await GroupRepository.getInstance().checkMemberStatus(groupId, userId);
   if(status == "banned") throw new AppError("You are banned from this group",403);
   if(!status) throw new AppError("You are not a member of this group",403);
   next();

}