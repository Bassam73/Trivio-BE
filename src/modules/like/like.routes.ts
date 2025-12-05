import express from "express"
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import {toggleLike} from "./like.controller";


const likeRouter = express.Router();
const validator = valid.createValidator();

likeRouter.patch("/toggle-like", toggleLike);