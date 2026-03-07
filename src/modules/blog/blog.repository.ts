import type {
  Blog,
  Prisma,
  PrismaClient,
} from "../../../generated/prisma/client";
import { prisma } from "../../db/prisma";
import {
  paginate,
  type PaginateResult,
} from "../../utils/helpers/paginate.utils";
import {
  temporaryUploadService,
  type TemporaryUploadService,
} from "../upload/temporary-upload/temporary-upload.service";
import type {
  BlogFiltersDto,
  CreateBlogDto,
  UpdateBlogDto,
} from "./blog.schema";

export class BlogRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private temporaryUploadService: TemporaryUploadService,
  ) {}

  async create(dto: CreateBlogDto, userId: string) {
    const usedPublicIds = [dto.blogPublicId].filter(Boolean) as string[];

    return this.prisma.$transaction(async (tx) => {
      const blog = await tx.blog.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          content: dto.content as Prisma.InputJsonValue,
          tags: dto.tags,
          blogPublicId: dto.blogPublicId ?? null,
          blogSecureUrl: dto.blogSecureUrl ?? null,
          authorId: userId,
          isPublished: dto.isPublished ?? true,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePictureSecureUrl: true,
              profilePicturePublicId: true,
            },
          },
        },
      });

      if (usedPublicIds.length) {
        await this.temporaryUploadService.confirmUsed(
          userId,
          usedPublicIds,
          tx,
        );
      }

      return blog;
    });
  }

  async update(id: string, dto: UpdateBlogDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.blog.findUnique({
        where: { id },
      });

      if (!existing) throw new Error("Blog not found");

      const currentPublicIds = [existing.blogPublicId].filter(
        Boolean,
      ) as string[];
      const incomingPublicIds =
        dto.blogPublicId === undefined
          ? currentPublicIds
          : ([dto.blogPublicId].filter(Boolean) as string[]);

      const currentAll = new Set(currentPublicIds);
      const incomingAll = new Set(incomingPublicIds);

      const added = [...incomingAll].filter((pid) => !currentAll.has(pid));
      const removed = [...currentAll].filter((pid) => !incomingAll.has(pid));

      const updated = await tx.blog.update({
        where: { id },
        data: {
          title: dto.title ?? undefined,
          slug: dto.slug ?? undefined,
          content:
            dto.content !== undefined
              ? (dto.content as Prisma.InputJsonValue)
              : undefined,
          tags: dto.tags ?? undefined,
          blogPublicId: dto.blogPublicId ?? undefined,
          blogSecureUrl: dto.blogSecureUrl ?? undefined,
          isPublished: dto.isPublished ?? undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePictureSecureUrl: true,
              profilePicturePublicId: true,
            },
          },
        },
      });

      if (added.length) {
        await this.temporaryUploadService.confirmUsed(userId, added, tx);
      }

      if (removed.length) {
        await this.temporaryUploadService.markUnused(userId, removed, tx);
      }

      return updated;
    });
  }

  async hardDelete(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const blog = await tx.blog.findUnique({
        where: { id },
      });

      if (!blog) throw new Error("Blog not found");

      const publicIds = [blog.blogPublicId].filter(Boolean) as string[];

      if (publicIds.length) {
        await this.temporaryUploadService.markUnused(userId, publicIds, tx);
      }

      return await tx.blog.delete({
        where: { id },
      });
    });
  }

  async findById(id: string) {
    return await this.prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePictureSecureUrl: true,
            profilePicturePublicId: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePictureSecureUrl: true,
            profilePicturePublicId: true,
          },
        },
      },
    });
  }

  async findRawById(id: string) {
    return await this.prisma.blog.findUnique({
      where: { id },
    });
  }

  async findAll(filters: BlogFiltersDto): Promise<PaginateResult<Blog>> {
    const {
      search,
      tag,
      authorId,
      isPublished,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filters;

    const where: Prisma.BlogWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (typeof isPublished === "boolean") {
      where.isPublished = isPublished;
    }

    let orderBy: Prisma.BlogOrderByWithRelationInput = {
      createdAt: "desc",
    };

    if (sortBy) {
      orderBy = {
        [sortBy]: sortOrder ?? "desc",
      };
    }

    return paginate<Blog>({
      delegate: this.prisma.blog,
      where,
      page,
      limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePictureSecureUrl: true,
            profilePicturePublicId: true,
          },
        },
      },
    });
  }

  async findAllByAuthor(
    authorId: string,
    filters: Omit<BlogFiltersDto, "authorId">,
  ): Promise<PaginateResult<Blog>> {
    return this.findAll({
      ...filters,
      authorId,
    });
  }

  async findLikedPostsByUserId(
    userId: string,
    filters: Omit<BlogFiltersDto, "authorId">,
  ) {
    const { page, limit, search, tag, sortBy, sortOrder } = filters;

    const where: Prisma.BlogLikeWhereInput = {
      userId,
      blog: {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
              ],
            }
          : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
    };

    let orderBy: Prisma.BlogLikeOrderByWithRelationInput = {
      createdAt: "desc",
    };

    if (
      sortBy === "createdAt" ||
      sortBy === "updatedAt" ||
      sortBy === "likesCount" ||
      sortBy === "title"
    ) {
      if (sortBy === "createdAt") {
        orderBy = { blog: { createdAt: sortOrder ?? "desc" } };
      }

      if (sortBy === "updatedAt") {
        orderBy = { blog: { updatedAt: sortOrder ?? "desc" } };
      }

      if (sortBy === "likesCount") {
        orderBy = { blog: { likesCount: sortOrder ?? "desc" } };
      }

      if (sortBy === "title") {
        orderBy = { blog: { title: sortOrder ?? "asc" } };
      }
    }

    return paginate({
      delegate: this.prisma.blogLike,
      where,
      page,
      limit,
      orderBy,
      include: {
        blog: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePictureSecureUrl: true,
                profilePicturePublicId: true,
              },
            },
          },
        },
      },
    });
  }

  async findUsersWhoLikedBlog(
    blogId: string,
    filters: Pick<BlogFiltersDto, "page" | "limit">,
  ) {
    const { page, limit } = filters;

    return paginate({
      delegate: this.prisma.blogLike,
      where: { blogId },
      page,
      limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePictureSecureUrl: true,
            profilePicturePublicId: true,
          },
        },
      },
    });
  }

  async incrementLikesCount(blogId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return await client.blog.update({
      where: { id: blogId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });
  }

  async decrementLikesCount(blogId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return await client.blog.update({
      where: { id: blogId },
      data: {
        likesCount: {
          decrement: 1,
        },
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const blog = await tx.blog.findUnique({
        where: { id },
      });

      if (!blog) {
        throw new Error("Blog not found");
      }

      const publicIds = [blog.blogPublicId].filter(Boolean) as string[];

      if (publicIds.length) {
        await this.temporaryUploadService.markUnused(userId, publicIds, tx);
      }

      return await tx.blog.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: userId,
        },
      });
    });
  }
}

export const blogRepository = new BlogRepository(
  prisma,
  temporaryUploadService,
);
