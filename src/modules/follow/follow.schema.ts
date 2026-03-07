import { z } from "zod";

export class FollowSchema {
  static followUserParams = z.object({
    userId: z.string().uuid("Invalid user id"),
  });

  static followListQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().optional(),
  });
}

export type FollowUserParamsDto = z.infer<typeof FollowSchema.followUserParams>;
export type FollowListQueryDto = z.infer<typeof FollowSchema.followListQuery>;
