import type { AppError } from "../errors/AppError";
import type { Result } from "./Result";

export interface BaseUseCase<TInput, TOutput, TError = AppError> {
  execute(input: TInput): Promise<Result<TOutput, TError>>;
}
