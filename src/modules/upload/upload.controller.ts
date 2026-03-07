import type { Request, Response } from "express";
import {
  ALLOWED_MIME_TYPES,
  type PublicUploadSignatureDTO,
  type UploadSignatureDTO,
} from "./upload.schema";
import { uploadService, type UploadService } from "./upload.service";
import type { AuthenticatedUser } from "../auth/auth.interface";

export class UploadController {
  constructor(private uploadService: UploadService) {}

  public getSignature = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const userKey = user?.id;
    const dto = req.body as UploadSignatureDTO;

    const result = await this.uploadService.createSignature({
      userKey,
      fileBase: dto.fileBase,
      entity: dto.entity,
      replace: dto.replace,
    });

    res.status(result.status_code).json(result);
  };

  public getPublicSignature = async (req: Request, res: Response) => {
    const dto = req.body as PublicUploadSignatureDTO;

    if (!ALLOWED_MIME_TYPES.includes(dto.mimeType)) {
      res.status(400).json({ message: "File type not allowed." });
    }

    const result = await this.uploadService.createPublicSignature();

    res.status(result.status_code).json(result);
  };
}

export const uploadController = new UploadController(uploadService);
