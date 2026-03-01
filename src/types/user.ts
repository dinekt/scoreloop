import type { User as PrismaUser, Plan } from "@prisma/client";

export type { Plan };

export type User = PrismaUser;

export type UserGolfProfile = Pick<
  User,
  "averageScore" | "headSpeed" | "handicap" | "golfStartYear" | "homeCourseName"
>;

export type UserProfile = Pick<
  User,
  "id" | "email" | "displayName" | "plan" | "planExpiresAt"
> &
  UserGolfProfile;
