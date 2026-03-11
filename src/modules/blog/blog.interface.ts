import type { Prisma } from "../../../generated/prisma/client";

export type BlogContent = Prisma.InputJsonValue;

export interface BlogEntity {
  id: string;
  title: string;
  slug: string;
  content: Prisma.JsonValue;
  tags: string[];
  blogPublicId: string | null;
  blogSecureUrl: string | null;
  authorId: string;
  likesCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
