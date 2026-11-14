import type { AppError } from "../errors/AppError";

export class Result<T, E = AppError> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._value = value;
    this._error = error;
  }

  public get value(): T {
    if (!this.isSuccess || this._value === undefined) {
      throw new Error("Cannot access value of a failed Result");
    }
    return this._value;
  }

  public get error(): E {
    if (this.isSuccess || this._error === undefined) {
      throw new Error("Cannot access error of a successful Result");
    }
    return this._error;
  }

  public static ok<U, F = AppError>(value: U): Result<U, F> {
    return new Result<U, F>(true, value);
  }

  public static fail<U, F = AppError>(error: F): Result<U, F> {
    return new Result<U, F>(false, undefined, error);
  }
}
