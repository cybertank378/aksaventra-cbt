import { prisma as defaultPrisma, type PrismaClient } from "@/libs/prisma";
import type { UserRole } from "@/security/rbacConfig";
import type { ListUsersQuery } from "../domain/dto/UserDTO";
import { UserEntity } from "../domain/entities/UserEntity";
import type {
  BulkUpdateUserRoleRecordData,
  CreateStaffUserRecordData,
  UpdateStaffUserRecordData,
  UsersRepositoryInterface,
} from "../domain/interfaces/UsersRepositoryInterface";

const USER_PUBLIC_SELECT = {
  id: true,
  moodleUserId: true,
  username: true,
  fullName: true,
  role: true,
  className: true,
  roomCode: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

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
      select: USER_PUBLIC_SELECT,
    });
    return user ? this.mapToEntity(user) : null;
  }

  public async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.db.user.findUnique({
      where: { username },
      select: USER_PUBLIC_SELECT,
    });
    return user ? this.mapToEntity(user) : null;
  }

  public async findByMoodleId(
    moodleUserId: number,
  ): Promise<UserEntity | null> {
    const user = await this.db.user.findUnique({
      where: { moodleUserId },
      select: USER_PUBLIC_SELECT,
    });
    return user ? this.mapToEntity(user) : null;
  }

  public async findByRole(role: UserRole): Promise<UserEntity[]> {
    const users = await this.db.user.findMany({
      where: { role },
      select: USER_PUBLIC_SELECT,
      orderBy: { fullName: "asc" },
    });
    return users.map((u: Parameters<typeof this.mapToEntity>[0]) =>
      this.mapToEntity(u),
    );
  }

  public async findManyByIds(ids: string[]): Promise<UserEntity[]> {
    if (ids.length === 0) return [];
    const users = await this.db.user.findMany({
      where: { id: { in: ids } },
      select: USER_PUBLIC_SELECT,
      orderBy: { fullName: "asc" },
    });
    return users.map((u: Parameters<typeof this.mapToEntity>[0]) =>
      this.mapToEntity(u),
    );
  }

  public async listUsers(
    query: ListUsersQuery,
  ): Promise<{ users: UserEntity[]; total: number }> {
    const { role, excludeRole, roomCode, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const whereClause: {
      role?: UserRole | { not: UserRole };
      roomCode?: string;
      OR?: Array<{
        username?: { contains: string };
        fullName?: { contains: string };
      }>;
    } = {};

    if (role) {
      whereClause.role = role;
    } else if (excludeRole) {
      whereClause.role = { not: excludeRole };
    }
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
        select: USER_PUBLIC_SELECT,
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

  public async createStaffUser(
    data: CreateStaffUserRecordData,
  ): Promise<UserEntity> {
    const created = await this.db.user.create({
      data: {
        username: data.username,
        fullName: data.fullName,
        passwordHash: data.passwordHash,
        role: data.role,
        roomCode: data.roomCode,
        isActive: data.isActive,
      },
      select: USER_PUBLIC_SELECT,
    });
    return this.mapToEntity(created);
  }

  public async updateStaffUser(
    id: string,
    data: UpdateStaffUserRecordData,
  ): Promise<UserEntity> {
    const updated = await this.db.user.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        roomCode: data.roomCode,
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      select: USER_PUBLIC_SELECT,
    });
    return this.mapToEntity(updated);
  }

  public async deleteById(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }

  public async bulkUpdateRoles(
    ids: string[],
    data: BulkUpdateUserRoleRecordData,
  ): Promise<UserEntity[]> {
    if (ids.length === 0) return [];

    await this.db.user.updateMany({
      where: { id: { in: ids } },
      data: {
        role: data.role,
        roomCode: data.roomCode,
        ...(data.clearClass ? { classGroupId: null, className: null } : {}),
      },
    });

    return await this.findManyByIds(ids);
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
      select: USER_PUBLIC_SELECT,
    });

    return this.mapToEntity(saved);
  }
}
