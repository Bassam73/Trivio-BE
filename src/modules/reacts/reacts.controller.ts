import { NextFunction, Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import ReactsService from "./reacts.service";
import AppError from "../../core/utils/AppError";

const reactsService = ReactsService.getInstance();

export const updateReaction = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reaction } = req.body || {};
    const userId = req.user?.id;

    if (!userId) throw new AppError("User not authenticated", 401);

    const updatedReaction = await reactsService.updateReaction({
      reactionId: id,
      userId,
      reaction,
    });

    res.status(200).json({
      status: "success",
      data: {
        reaction: updatedReaction,
      },
    });
  }
);

export const deleteReaction = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new AppError("User not authenticated", 401);

    await reactsService.deleteReaction(id, userId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
