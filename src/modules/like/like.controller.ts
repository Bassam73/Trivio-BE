import { NextFunction, Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import LikeService from "./like.service";

const service = LikeService.getInstance();

const toggleLike = catchError(
    async (req: Request, res: Response, next: NextFunction) => {
        const data: any = req.body;
        const user = await service.toggleLike(data);
        res.status(200).json({ status: "success", data: [user] });
    }
);

export { toggleLike };