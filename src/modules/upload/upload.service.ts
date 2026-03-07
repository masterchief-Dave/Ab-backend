import { env } from "../../config/env.config";
import { logger } from "../../middleware/logger.middleware";
import { ApiSuccess } from "../../utils/api-response.utils";
import {
  temporaryUploadService,
  type TemporaryUploadService,
} from "./temporary-upload/temporary-upload.service";
import {
  buildFolder,
  buildPublicId,
  randomNonce,
  signCloudinaryParams,
} from "./upload.helper";

export class UploadService {
  constructor(private temporaryUploadService: TemporaryUploadService) {}

  public createSignature = async ({
    userKey,
    fileBase,
    entity,
    resource_type: _resource_type = "auto",
    type: _type = "upload",
  }: {
    userKey: string;
    fileBase: string;
    entity?: string;
    replace?: boolean;
    resource_type?: "auto" | "image" | "raw" | "video";
    type?: "upload" | "private" | "authenticated";
  }) => {
    const folder = buildFolder(userKey, entity);
    const publicId = buildPublicId(fileBase);
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = randomNonce();
    const context = `nonce=${nonce}`;

    logger.info({ publicId });

    const paramsToSign = {
      timestamp,
      folder,
      public_id: publicId,
      context,
    };

    const signature = signCloudinaryParams(
      paramsToSign,
      env.CLOUDINARY_API_SECRET,
    );

    await this.temporaryUploadService.trackSignature(userKey, publicId);

    return ApiSuccess.ok("Upload signature created successfully", {
      cloudName: env.CLOUDINARY_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      signature,
      timestamp,
      folder,
      publicId,
      context,
    });
  };

  public createPublicSignature = async () => {
    const folder = "guest_uploads/quarantine";
    const publicId = `${randomNonce()}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const tags = "guest,unverified";
    const context = `source=public_api`;
    const upload_preset = "guest_public_uploads";

    const paramsToSign = {
      timestamp,
      folder,
      public_id: publicId,
      tags,
      context,
      upload_preset,
    };

    const signature = signCloudinaryParams(
      paramsToSign,
      env.CLOUDINARY_API_SECRET,
    );

    return ApiSuccess.ok("Public upload signature created", {
      cloudName: env.CLOUDINARY_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      signature,
      timestamp,
      folder,
      publicId,
      tags,
      context,
      upload_preset,
    });
  };
}
export const uploadService = new UploadService(temporaryUploadService);
