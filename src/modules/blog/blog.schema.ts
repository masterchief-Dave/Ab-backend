import { z } from "zod";

export class BlogSchema {
  static create = z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    slug: z.string().trim().min(3, "Slug must be at least 3 characters"),
    content: z.any(),
    tags: z.array(z.string().trim().min(1)).default([]),
    blogPublicId: z.string().trim().min(1).optional().nullable(),
    blogSecureUrl: z.string().trim().min(1).optional().nullable(),
    isPublished: z.boolean().optional(),
  });

  static update = this.create.partial();

  static filter = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().optional(),
    tag: z.string().trim().optional(),
    authorId: z.string().uuid().optional(),
    isPublished: z.coerce.boolean().optional(),
    sortBy: z
      .enum(["createdAt", "updatedAt", "likesCount", "title"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  });
}

export type CreateBlogDto = z.infer<typeof BlogSchema.create>;
export type UpdateBlogDto = z.infer<typeof BlogSchema.update>;
export type BlogFiltersDto = z.infer<typeof BlogSchema.filter>;
