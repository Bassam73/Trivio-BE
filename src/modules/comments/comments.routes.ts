import express from "express";
import valid from "express-joi-validation";
const validator = valid.createValidator();
const commentsRouter = express.Router();

export default commentsRouter;
