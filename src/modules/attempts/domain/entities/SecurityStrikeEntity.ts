import type { ViolationEventType } from "@prisma/client";
import { BaseEntity } from "@/core/base/BaseEntity";

export interface SecurityStrikeProps {
  id?: string;
  attemptId: string;
  eventType: ViolationEventType;
  details?: Record<string, unknown>;
  createdAt?: Date;
}

export class SecurityStrikeEntity extends BaseEntity<string> {
  public readonly attemptId: string;
  public readonly eventType: ViolationEventType;
  public readonly details?: Record<string, unknown>;

  constructor(props: SecurityStrikeProps) {
    super(props.id ?? "", props.createdAt);
    this.attemptId = props.attemptId;
    this.eventType = props.eventType;
    this.details = props.details;
  }
}
