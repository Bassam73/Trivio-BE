import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "";

    if (req.baseUrl.includes("posts")) {
      console.log(__dirname);
      uploadPath = path.join(__dirname, "../../../uploads/posts");
    } else if (req.baseUrl.includes("groups")) {
      if(req.url.includes("/post")){
        uploadPath = path.join(__dirname, "../../../uploads/groups/posts");
      }else{
        uploadPath = path.join(__dirname, "../../../uploads/groups");
      }
    }
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|mov|wmv|flv|webm|matroska|msvideo|quicktime/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed!"));
  }
};

const uploadMedia = multer({
  storage,
  fileFilter,
});

const fileFilterImage = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};

const uploadImage = multer({
  storage,
  fileFilter: fileFilterImage,
});

export { uploadMedia, uploadImage };
