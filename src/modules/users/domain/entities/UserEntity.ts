import { BaseEntity } from "@/core/base/BaseEntity";
import type { UserRole } from "@/security/rbacConfig";
import type { UserResponseDTO } from "../dto/UserDTO";

export class UserEntity extends BaseEntity<string> {
  public readonly moodleUserId?: number | null;
  public readonly username: string;
  public readonly fullName: string;
  public readonly role: UserRole;
  public readonly className?: string | null;
  public readonly roomCode?: string | null;
  public readonly isActive: boolean;

  constructor(params: {
    id: string;
    moodleUserId?: number | null;
    username: string;
    fullName: string;
    role: UserRole;
    className?: string | null;
    roomCode?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(params.id, params.createdAt, params.updatedAt);
    this.moodleUserId = params.moodleUserId;
    this.username = params.username;
    this.fullName = params.fullName;
    this.role = params.role;
    this.className = params.className;
    this.roomCode = params.roomCode;
    this.isActive = params.isActive ?? true;
  }

  public toDTO(): UserResponseDTO {
    return {
      id: this.id,
      moodleUserId: this.moodleUserId,
      username: this.username,
      fullName: this.fullName,
      role: this.role,
      className: this.className,
      roomCode: this.roomCode,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }
}
