import type {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../../generated/prisma/enums";

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleEnum;
}

export interface UserEntity {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  gender: GenderEnum | null;
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  role: RoleEnum;
  provider: ProviderEnum;
  providerId: string | null;
  passwordVersion: number;
  jwtVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
