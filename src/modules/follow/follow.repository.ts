import type { PrismaClient } from "../../../generated/prisma/client";
import { prisma } from "../../db/prisma";

export class FollowRepository {
  constructor(private readonly prisma: PrismaClient) {}
  public findByFollowerIdAndFollowingId = async (
    followerId: string,
    followingId: string,
  ) => {
    return await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  };

  public create = async (followerId: string, followingId: string) => {
    return await this.prisma.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });
  };

  public deleteByFollowerIdAndFollowingId = async (
    followerId: string,
    followingId: string,
  ) => {
    return await this.prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  };

  public findFollowingByUserId = async ({
    userId,
    skip,
    take,
  }: {
    userId: string;
    skip: number;
    take: number;
  }) => {
    return await this.prisma.userFollow.findMany({
      where: {
        followerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePictureSecureUrl: true,
            profilePicturePublicId: true,
            createdAt: true,
          },
        },
      },
    });
  };

  public countFollowingByUserId = async (userId: string) => {
    return await this.prisma.userFollow.count({
      where: {
        followerId: userId,
      },
    });
  };

  public findFollowersByUserId = async ({
    userId,
    skip,
    take,
  }: {
    userId: string;
    skip: number;
    take: number;
  }) => {
    return await this.prisma.userFollow.findMany({
      where: {
        followingId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePictureSecureUrl: true,
            profilePicturePublicId: true,
            createdAt: true,
          },
        },
      },
    });
  };

  public countFollowersByUserId = async (userId: string) => {
    return await this.prisma.userFollow.count({
      where: {
        followingId: userId,
      },
    });
  };

  public findFollowingIdsByUserId = async (userId: string) => {
    const records = await this.prisma.userFollow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    return records.map((item) => item.followingId);
  };
}

export const followRepository = new FollowRepository(prisma);
