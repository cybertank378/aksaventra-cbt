import { BaseEntity } from "@/core/base/BaseEntity";
import type { UserRole } from "@/security/rbacConfig";
import type { UserSessionDTO } from "../dto/AuthDTO";

export class UserSessionEntity extends BaseEntity<string> {
  public readonly username: string;
  public readonly fullName: string;
  public readonly role: UserRole;
  public readonly className?: string | null;
  public readonly roomCode?: string | null;
  public readonly deviceHash?: string | null;
  public readonly isActive: boolean;

  constructor(params: {
    id: string;
    username: string;
    fullName: string;
    role: UserRole;
    className?: string | null;
    roomCode?: string | null;
    deviceHash?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(params.id, params.createdAt, params.updatedAt);
    this.username = params.username;
    this.fullName = params.fullName;
    this.role = params.role;
    this.className = params.className;
    this.roomCode = params.roomCode;
    this.deviceHash = params.deviceHash;
    this.isActive = params.isActive ?? true;
  }

  public toDTO(): UserSessionDTO {
    return {
      id: this.id,
      username: this.username,
      fullName: this.fullName,
      role: this.role,
      className: this.className,
      roomCode: this.roomCode,
    };
  }
}
