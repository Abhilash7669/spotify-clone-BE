import multer from "multer";
import { MulterCreateStorage } from "../types/multer.types.js";
import path from "path";
import { IMulterFilePath } from "../interface/auth.interface.js";
// TODO: Re-work to make it reusable inside controllers instead as a middleware

export namespace LILLY_MULTER {
  export function createMulterStorage(options: MulterCreateStorage) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        if (!file) cb(null, "");
        cb(null, `${options.filePath}`);
      },
      filename: (req: IMulterFilePath, file, cb) => {
        if (!file) cb(null, "");

        const fileExtension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = file.fieldname + "-" + uniqueSuffix + fileExtension;
        cb(null, fileName);
        req.filePath = `${options.filePath}/${fileName}`;
      },
    });

    const upload = multer({
      storage,
      ...(options.filterFunction ? { fileFilter: options.filterFunction } : {}),
    });

    return upload;
  }

  // re-worked and replace above
  export function multerStorage(options?: MulterCreateStorage) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        if (!file) cb(null, "");
        cb(null, `uploads/`);
      },
      filename: (req: IMulterFilePath, file, cb) => {
        if (!file) cb(null, "");

        const fileExtension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = file.fieldname + "-" + uniqueSuffix + fileExtension;
        cb(null, fileName);
        // req.filePath = `${options.filePath}/${fileName}`;
      },
    });

    const upload = multer({
      storage,
      ...(options?.filterFunction ? { fileFilter: options.filterFunction } : {}),
    });

    return upload;
  }
}
