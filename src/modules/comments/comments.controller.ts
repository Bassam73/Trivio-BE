import { NextFunction, Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import CommentsService from "./comments.service";
import AppError from "../../core/utils/AppError";

const commentsService = CommentsService.getInstance();

export const getComment = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cid } = req.params;
    const comment = await commentsService.getCommentByID(cid);
    if (!comment) throw new AppError("Comment not found", 404);
    res.status(200).json({
      status: "success",
      data: {
        comment,
      },
    });
  },
);

export const updateComment = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cid } = req.params;
    const { text } = req.body || {};    
    const userId = req.user?.id;

    if (!userId) throw new AppError("User not authenticated", 401);

    const updatedComment = await commentsService.updateComment({
      cid,
      userId,
      text,
    });

    res.status(200).json({
      status: "success",
      data: {
        comment: updatedComment,
      },
    });
  },
);

export const deleteComment = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cid } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new AppError("User not authenticated", 401);

    await commentsService.deleteComment(cid, userId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const createReply = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cid } = req.params;
    const { text } = req.body || {};
    const userId = req.user?.id;

    if (!userId) throw new AppError("User not authenticated", 401);

    const reply = await commentsService.createReply({
      userId,
      postId: "", // Will be assigned in the service from the parent comment
      parent: cid,
      text,
    });

    res.status(201).json({
      status: "success",
      data: {
        reply,
      },
    });
  }
);

export const getReplies = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cid } = req.params;
    const replies = await commentsService.getReplies(cid, req.query);

    res.status(200).json({
      status: "success",
      data: replies,
    });
  }
);