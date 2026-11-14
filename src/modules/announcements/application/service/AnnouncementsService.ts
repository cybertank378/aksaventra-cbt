import { BaseService } from "@/core/base/BaseService";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  AnnouncementItemDTO,
  CreateAnnouncementInputDTO,
} from "../../domain/dto/AnnouncementDTO";
import { ManageAnnouncementsUseCase } from "../usecases/ManageAnnouncementsUseCase";

export class AnnouncementsService extends BaseService {
  private readonly manageAnnouncementsUseCase: ManageAnnouncementsUseCase;

  constructor() {
    super("AnnouncementsService");
    this.manageAnnouncementsUseCase = new ManageAnnouncementsUseCase();
  }

  public async getAnnouncements(): Promise<
    Result<AnnouncementItemDTO[], AppError>
  > {
    return this.execute(async () =>
      Result.ok(await this.manageAnnouncementsUseCase.getAnnouncements()),
    );
  }

  public async createAnnouncement(
    input: CreateAnnouncementInputDTO,
    authorName?: string,
  ): Promise<Result<AnnouncementItemDTO, AppError>> {
    return this.execute(async () =>
      Result.ok(
        await this.manageAnnouncementsUseCase.createAnnouncement(
          input,
          authorName,
        ),
      ),
    );
  }

  public async deleteAnnouncement(
    id: string,
  ): Promise<Result<boolean, AppError>> {
    return this.execute(async () =>
      Result.ok(await this.manageAnnouncementsUseCase.deleteAnnouncement(id)),
    );
  }
}
