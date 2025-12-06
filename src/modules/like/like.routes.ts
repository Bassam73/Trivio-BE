import express from "express"
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import {toggleLike} from "./like.controller";
import { toggleLikeVal } from "./like.validation";


const likeRouter = express.Router();
const validator = valid.createValidator();

likeRouter.patch("/toggle-like", validator.body(toggleLikeVal), toggleLike);