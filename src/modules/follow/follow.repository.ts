import type { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { prisma } from "../../db/prisma";
import { paginate } from "../../utils/helpers/paginate.utils";
import type { FollowListQueryDto } from "./follow.schema";

export class FollowRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByFollowerIdAndFollowingId(
    followerId: string,
    followingId: string,
  ) {
    return await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async create(followerId: string, followingId: string) {
    return await this.prisma.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async deleteByFollowerIdAndFollowingId(
    followerId: string,
    followingId: string,
  ) {
    return await this.prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async findFollowingByUserId(userId: string, query: FollowListQueryDto) {
    const where: Prisma.UserFollowWhereInput = {
      followerId: userId,
      following: {
        isDeleted: false,
        ...(query.search
          ? {
              OR: [
                {
                  firstName: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
    };

    return paginate({
      delegate: this.prisma.userFollow,
      where,
      page: query.page,
      limit: query.limit,
      orderBy: {
        createdAt: "desc",
      },
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
  }

  async findFollowersByUserId(userId: string, query: FollowListQueryDto) {
    const where: Prisma.UserFollowWhereInput = {
      followingId: userId,
      follower: {
        isDeleted: false,
        ...(query.search
          ? {
              OR: [
                {
                  firstName: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
    };

    return paginate({
      delegate: this.prisma.userFollow,
      where,
      page: query.page,
      limit: query.limit,
      orderBy: {
        createdAt: "desc",
      },
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
  }

  async findFollowingIdsByUserId(userId: string) {
    const records = await this.prisma.userFollow.findMany({
      where: {
        followerId: userId,
        following: {
          isDeleted: false,
        },
      },
      select: {
        followingId: true,
      },
    });

    return records.map((item) => item.followingId);
  }
}

export const followRepository = new FollowRepository(prisma);
