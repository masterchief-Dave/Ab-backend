import type { PrismaClient } from "../../../generated/prisma/client";
import { prisma } from "../../db/prisma";

export class BlogLikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public findByBlogIdAndUserId = async (blogId: string, userId: string) => {
    return await this.prisma.blogLike.findUnique({
      where: {
        blogId_userId: {
          blogId,
          userId,
        },
      },
    });
  };

  public create = async (blogId: string, userId: string) => {
    return await this.prisma.blogLike.create({
      data: {
        blogId,
        userId,
      },
    });
  };

  public delete = async (blogId: string, userId: string) => {
    return await this.prisma.blogLike.delete({
      where: {
        blogId_userId: {
          blogId,
          userId,
        },
      },
    });
  };

  public findUsersWhoLikedBlog = async ({
    blogId,
    skip,
    take,
  }: {
    blogId: string;
    skip: number;
    take: number;
  }) => {
    return await this.prisma.blogLike.findMany({
      where: { blogId },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
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
  };

  public countUsersWhoLikedBlog = async (blogId: string) => {
    return await this.prisma.blogLike.count({
      where: { blogId },
    });
  };

  public findLikedPostsByUserId = async ({
    userId,
    skip,
    take,
  }: {
    userId: string;
    skip: number;
    take: number;
  }) => {
    return await this.prisma.blogLike.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
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
  };

  public countLikedPostsByUserId = async (userId: string) => {
    return await this.prisma.blogLike.count({
      where: { userId },
    });
  };
}

export const blogLikeRepository = new BlogLikeRepository(prisma);
