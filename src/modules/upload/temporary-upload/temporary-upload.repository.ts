import type { PrismaClient } from "../../../../generated/prisma/client";
import { prisma } from "../../../db/prisma";
import type { DbClient } from "../../../shared/interface/db.interface";

export class TemporaryUploadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPending(userId: string, publicId: string, tx?: DbClient) {
    const db = tx ?? this.prisma;
    return db.temporaryUpload.upsert({
      where: { publicId },
      create: { userId, publicId, isConfirmed: false },
      update: {
        userId,
        isConfirmed: false,
      },
    });
  }

  async confirmMany(userId: string, publicIds: string[], tx?: DbClient) {
    if (!publicIds.length) return { count: 0 };
    const db = tx ?? this.prisma;
    return db.temporaryUpload.updateMany({
      where: { userId, publicId: { in: publicIds } },
      data: { isConfirmed: true },
    });
  }

  async unconfirmMany(userId: string, publicIds: string[], tx?: DbClient) {
    if (!publicIds.length) return { count: 0 };
    const db = tx ?? this.prisma;
    return db.temporaryUpload.updateMany({
      where: { userId, publicId: { in: publicIds } },
      data: { isConfirmed: false },
    });
  }
}

export const temporaryUploadRepository = new TemporaryUploadRepository(prisma);
