import type { DbClient } from "../../../shared/interface/db.interface";
import {
  temporaryUploadRepository,
  type TemporaryUploadRepository,
} from "./temporary-upload.repository";

export class TemporaryUploadService {
  constructor(private readonly repo: TemporaryUploadRepository) {}

  async trackSignature(userId: string, publicId: string) {
    return this.repo.createPending(userId, publicId);
  }

  async confirmUsed(userId: string, publicIds: string[], tx?: DbClient) {
    return this.repo.confirmMany(userId, [...new Set(publicIds)], tx);
  }

  async markUnused(userId: string, publicIds: string[], tx?: DbClient) {
    return this.repo.unconfirmMany(userId, [...new Set(publicIds)], tx);
  }
}

export const temporaryUploadService = new TemporaryUploadService(
  temporaryUploadRepository,
);
