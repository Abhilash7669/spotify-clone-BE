import { Request } from "express";
import multer from "multer";

export type MulterFilterFunctionType = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => void;

export type MulterCreateStorage = {
  filePath: string;
  filterFunction?: MulterFilterFunctionType;
};

export type MulterFile = Express.Multer.File;
export type MulterFiles = Array<MulterFile>;

export type UploadedFiles =
  | { [fieldname: string]: MulterFiles }
  | MulterFiles
  | undefined;
