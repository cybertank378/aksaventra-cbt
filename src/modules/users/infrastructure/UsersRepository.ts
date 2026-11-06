import { prisma as defaultPrisma, type PrismaClient } from "@/libs/prisma";
import type { UserRole } from "@/security/rbacConfig";
import type { ListUsersQuery } from "../domain/dto/UserDTO";
import { UserEntity } from "../domain/entities/UserEntity";
import type { UsersRepositoryInterface } from "../domain/interfaces/UsersRepositoryInterface";

export class UsersRepository implements UsersRepositoryInterface {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  private mapToEntity(user: {
    id: string;
    moodleUserId: number | null;
    username: string;
    fullName: string;
    role: string;
    className: string | null;
    roomCode: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity({
      id: user.id,
      moodleUserId: user.moodleUserId,
      username: user.username,
      fullName: user.fullName,
      role: user.role as UserRole,
      className: user.className,
      roomCode: user.roomCode,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  public async findById(id: string): Promise<UserEntity | null> {
    const user = await this.db.user.findUnique({
      where: { id },
    });
    return user ? this.mapToEntity(user) : null;
  }

  public async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.db.user.findUnique({
      where: { username },
    });
    return user ? this.mapToEntity(user) : null;
  }

  public async findByMoodleId(
    moodleUserId: number,
  ): Promise<UserEntity | null> {
    const user = await this.db.user.findUnique({
      where: { moodleUserId },
    });
    return user ? this.mapToEntity(user) : null;
  }

  public async findByRole(role: UserRole): Promise<UserEntity[]> {
    const users = await this.db.user.findMany({
      where: { role },
      orderBy: { fullName: "asc" },
    });
    return users.map((u: Parameters<typeof this.mapToEntity>[0]) =>
      this.mapToEntity(u),
    );
  }

  public async listUsers(
    query: ListUsersQuery,
  ): Promise<{ users: UserEntity[]; total: number }> {
    const { role, roomCode, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const whereClause: {
      role?: UserRole;
      roomCode?: string;
      OR?: Array<{
        username?: { contains: string };
        fullName?: { contains: string };
      }>;
    } = {};

    if (role) whereClause.role = role;
    if (roomCode) whereClause.roomCode = roomCode;
    if (search && search.trim() !== "") {
      whereClause.OR = [
        { username: { contains: search.trim() } },
        { fullName: { contains: search.trim() } },
      ];
    }

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { fullName: "asc" },
      }),
      this.db.user.count({ where: whereClause }),
    ]);

    return {
      users: users.map((u: Parameters<typeof this.mapToEntity>[0]) =>
        this.mapToEntity(u),
      ),
      total,
    };
  }

  public async save(entity: UserEntity): Promise<UserEntity> {
    const saved = await this.db.user.upsert({
      where: { id: entity.id },
      create: {
        id: entity.id,
        moodleUserId: entity.moodleUserId,
        username: entity.username,
        fullName: entity.fullName,
        passwordHash: "",
        role: entity.role,
        className: entity.className,
        roomCode: entity.roomCode,
        isActive: entity.isActive,
      },
      update: {
        fullName: entity.fullName,
        className: entity.className,
        roomCode: entity.roomCode,
        isActive: entity.isActive,
      },
    });

    return this.mapToEntity(saved);
  }
}
