"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.uploadMedia = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = "";
        if (req.baseUrl.includes("posts")) {
            console.log(__dirname);
            uploadPath = path_1.default.join(__dirname, "../../../uploads/posts");
        }
        else if (req.baseUrl.includes("groups")) {
            if (req.url.includes("/post")) {
                uploadPath = path_1.default.join(__dirname, "../../../uploads/groups/posts");
            }
            else {
                uploadPath = path_1.default.join(__dirname, "../../../uploads/groups");
            }
        }
        else {
            uploadPath = path_1.default.join(__dirname, "../../../uploads/avatars");
        }
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + extension);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|mov|wmv|flv|webm|matroska|msvideo|quicktime/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new Error("Only images and videos are allowed!"));
    }
};
const uploadMedia = (0, multer_1.default)({
    storage,
    fileFilter,
});
exports.uploadMedia = uploadMedia;
const fileFilterImage = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new Error("Only images are allowed!"));
    }
};
const uploadImage = (0, multer_1.default)({
    storage,
    fileFilter: fileFilterImage,
});
exports.uploadImage = uploadImage;
