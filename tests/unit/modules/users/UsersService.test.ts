import { describe, expect, it, vi } from "vitest";
import { UsersService } from "@/modules/users/application/UsersService";
import { GetUserProfileUseCase } from "@/modules/users/application/usecases/GetUserProfileUseCase";
import { ListUsersUseCase } from "@/modules/users/application/usecases/ListUsersUseCase";
import { UserEntity } from "@/modules/users/domain/entities/UserEntity";
import type { UsersRepositoryInterface } from "@/modules/users/domain/interfaces/UsersRepositoryInterface";

describe("UsersService & UseCases", () => {
  const mockTeacher = new UserEntity({
    id: "user-t-1",
    username: "guru_fisika",
    fullName: "Dr. Hendra Wijaya",
    role: "TEACHER",
    isActive: true,
  });

  const createMockRepo = (
    overrides?: Partial<UsersRepositoryInterface>,
  ): UsersRepositoryInterface => ({
    findById: vi.fn().mockResolvedValue(mockTeacher),
    findByUsername: vi.fn(),
    findByMoodleId: vi.fn(),
    findByRole: vi.fn(),
    listUsers: vi.fn().mockResolvedValue({
      users: [mockTeacher],
      total: 1,
    }),
    save: vi.fn(),
    ...overrides,
  });

  it("fetches user profile successfully", async () => {
    const repo = createMockRepo();
    const service = new UsersService(
      new GetUserProfileUseCase(repo),
      new ListUsersUseCase(repo),
    );

    const result = await service.getProfile("user-t-1");
    expect(result.isSuccess).toBe(true);
    expect(result.value.username).toBe("guru_fisika");
    expect(result.value.role).toBe("TEACHER");
  });

  it("returns USER_NOT_FOUND when user ID does not exist", async () => {
    const repo = createMockRepo({
      findById: vi.fn().mockResolvedValue(null),
    });
    const service = new UsersService(
      new GetUserProfileUseCase(repo),
      new ListUsersUseCase(repo),
    );

    const result = await service.getProfile("missing-user-id");
    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("USER_NOT_FOUND");
  });

  it("lists users with pagination metadata", async () => {
    const repo = createMockRepo();
    const service = new UsersService(
      new GetUserProfileUseCase(repo),
      new ListUsersUseCase(repo),
    );

    const result = await service.listUsers({
      page: 1,
      limit: 10,
      role: "TEACHER",
    });
    expect(result.isSuccess).toBe(true);
    expect(result.value.users).toHaveLength(1);
    expect(result.value.total).toBe(1);
    expect(result.value.page).toBe(1);
    expect(result.value.limit).toBe(10);
  });
});
