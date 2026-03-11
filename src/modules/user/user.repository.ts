import { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { prisma } from "../../db/prisma";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(args: { userData: Prisma.UserCreateInput }) {
    return await this.prisma.user.create({
      data: args.userData,
    });
  }

  async updateById(id: string, args: { userData: Prisma.UserUpdateInput }) {
    return await this.prisma.user.update({
      where: { id },
      data: args.userData,
    });
  }

  async findProfile(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        lastName: true,
        firstName: true,
        email: true,
        gender: true,
        profilePictureSecureUrl: true,
      },
    });
  }

  public findPublicProfileById = async (userId: string) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePictureSecureUrl: true,
        profilePicturePublicId: true,
        createdAt: true,
      },
    });
  };
}

export const userRepository = new UserRepository(prisma);
