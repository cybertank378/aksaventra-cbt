import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  GetRoomParticipantsQueryDTO,
  GetRoomParticipantsResponseDTO,
  ProctorActionResponseDTO,
  RotateRoomTokenInputDTO,
  RotateRoomTokenResponseDTO,
} from "../../domain/dto/ProctorActionDTO";
import type { ProctorRepositoryInterface } from "../../domain/interfaces/ProctorRepositoryInterface";
import {
  type ExtendParticipantTimeInput,
  ExtendParticipantTimeUseCase,
} from "../usecases/ExtendParticipantTimeUseCase";
import {
  ForceSubmitAttemptUseCase,
  type ForceSubmitInput,
} from "../usecases/ForceSubmitAttemptUseCase";
import { GetRoomParticipantsUseCase } from "../usecases/GetRoomParticipantsUseCase";
import {
  ResetDeviceBindingUseCase,
  type ResetDeviceInput,
} from "../usecases/ResetDeviceBindingUseCase";
import { RotateRoomTokenUseCase } from "../usecases/RotateRoomTokenUseCase";
import {
  type UnlockParticipantInput,
  UnlockParticipantStrikeUseCase,
} from "../usecases/UnlockParticipantStrikeUseCase";

/* ============================================================
 * PROCTOR SERVICE
 * ============================================================
 * Responsibility:
 * - Application Facade & UseCase Orchestrator
 * - Thin Application Entry Point
 * - Delegates all operations to dedicated Use Cases
 * - ZERO direct repository access
 * ============================================================
 */
export class ProctorService extends BaseService {
  private readonly getRoomParticipantsUseCase: GetRoomParticipantsUseCase;
  private readonly rotateRoomTokenUseCase: RotateRoomTokenUseCase;
  private readonly unlockParticipantStrikeUseCase: UnlockParticipantStrikeUseCase;
  private readonly resetDeviceBindingUseCase: ResetDeviceBindingUseCase;
  private readonly extendParticipantTimeUseCase: ExtendParticipantTimeUseCase;
  private readonly forceSubmitAttemptUseCase: ForceSubmitAttemptUseCase;

  constructor(
    proctorRepo: ProctorRepositoryInterface,
    useCases?: {
      getRoomParticipantsUseCase?: GetRoomParticipantsUseCase;
      rotateRoomTokenUseCase?: RotateRoomTokenUseCase;
      unlockParticipantStrikeUseCase?: UnlockParticipantStrikeUseCase;
      resetDeviceBindingUseCase?: ResetDeviceBindingUseCase;
      extendParticipantTimeUseCase?: ExtendParticipantTimeUseCase;
      forceSubmitAttemptUseCase?: ForceSubmitAttemptUseCase;
    },
  ) {
    super("ProctorService");

    this.getRoomParticipantsUseCase =
      useCases?.getRoomParticipantsUseCase ??
      new GetRoomParticipantsUseCase(proctorRepo);

    this.rotateRoomTokenUseCase =
      useCases?.rotateRoomTokenUseCase ??
      new RotateRoomTokenUseCase(proctorRepo);

    this.unlockParticipantStrikeUseCase =
      useCases?.unlockParticipantStrikeUseCase ??
      new UnlockParticipantStrikeUseCase(proctorRepo);

    this.resetDeviceBindingUseCase =
      useCases?.resetDeviceBindingUseCase ??
      new ResetDeviceBindingUseCase(proctorRepo);

    this.extendParticipantTimeUseCase =
      useCases?.extendParticipantTimeUseCase ??
      new ExtendParticipantTimeUseCase(proctorRepo);

    this.forceSubmitAttemptUseCase =
      useCases?.forceSubmitAttemptUseCase ??
      new ForceSubmitAttemptUseCase(proctorRepo);
  }

  public getRoomParticipants(
    query: GetRoomParticipantsQueryDTO,
  ): Promise<Result<GetRoomParticipantsResponseDTO, AppError>> {
    return this.execute(() => this.getRoomParticipantsUseCase.execute(query));
  }

  public rotateRoomToken(
    input: RotateRoomTokenInputDTO,
  ): Promise<Result<RotateRoomTokenResponseDTO, AppError>> {
    return this.execute(() => this.rotateRoomTokenUseCase.execute(input));
  }

  public unlockParticipant(
    input: UnlockParticipantInput,
  ): Promise<Result<ProctorActionResponseDTO, AppError>> {
    return this.execute(() =>
      this.unlockParticipantStrikeUseCase.execute(input),
    );
  }

  public resetDeviceBinding(
    input: ResetDeviceInput,
  ): Promise<Result<ProctorActionResponseDTO, AppError>> {
    return this.execute(() => this.resetDeviceBindingUseCase.execute(input));
  }

  public extendParticipantTime(
    input: ExtendParticipantTimeInput,
  ): Promise<Result<ProctorActionResponseDTO, AppError>> {
    return this.execute(() => this.extendParticipantTimeUseCase.execute(input));
  }

  public forceSubmitAttempt(
    input: ForceSubmitInput,
  ): Promise<Result<ProctorActionResponseDTO, AppError>> {
    return this.execute(() => this.forceSubmitAttemptUseCase.execute(input));
  }
}
