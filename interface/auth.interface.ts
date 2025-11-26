import { Request } from "express";
import { MulterFiles } from "../types/multer.types.js";

export interface IAuthRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
  profilePicture?: string;
}

export interface IExtendedRequest extends IAuthRequest {
  filePath?: string;
  file?: Express.Multer.File;
  files?:
    | {
        [fieldname: string]: MulterFiles;
      }
    | MulterFiles;
  secure_url?: string;
}

export interface IMulterFilePath extends Request {
  filePath?: string;
}
export interface IAuthFileRequest extends IAuthRequest {
  file?: Express.Multer.File;
}
