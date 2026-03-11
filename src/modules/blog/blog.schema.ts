import { z } from "zod";

const tiptapMarkSchema = z.object({
  type: z.string().trim().min(1),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: Array<z.infer<typeof tiptapMarkSchema>>;
  text?: string;
  content?: TiptapNode[];
};

const tiptapNodeSchema: z.ZodType<TiptapNode> = z.lazy(() =>
  z.object({
    type: z.string().trim().min(1),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z.array(tiptapMarkSchema).optional(),
    text: z.string().optional(),
    content: z.array(tiptapNodeSchema).optional(),
  }),
);

const tiptapContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(tiptapNodeSchema).default([]),
});

export class BlogSchema {
  static create = z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    content: tiptapContentSchema,
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
    authorIds: z.array(z.string().uuid()).optional(),
    isPublished: z.coerce.boolean().optional(),
    sortBy: z
      .enum(["createdAt", "updatedAt", "likesCount", "title"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  });

  static blogLikesQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  });
}

export type CreateBlogDto = z.infer<typeof BlogSchema.create>;
export type UpdateBlogDto = z.infer<typeof BlogSchema.update>;
export type BlogFiltersDto = z.infer<typeof BlogSchema.filter>;
