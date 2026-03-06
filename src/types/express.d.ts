import type { UploadedFile } from "express-fileupload";
import type { AuthenticatedUser } from "../modules/auth/auth.interface";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      files?: {
        image?: UploadedFile | UploadedFile[];
        [key: string]: UploadedFile | UploadedFile[] | undefined;
      };
    }
  }
}
