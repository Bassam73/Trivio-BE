import { Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import GroupService from "./groups.service";
import { createGroupDTO, updateGroupDTO } from "../../types/group.types";

const service = GroupService.getInstance();

export const createGroup = catchError(async (req: Request, res: Response) => {
  const data: createGroupDTO = req.body;
  data.logo = req.file?.filename;
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
    data.data.logo = req.file.filename;
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
