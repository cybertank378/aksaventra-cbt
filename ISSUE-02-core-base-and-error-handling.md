# 🧱 ISSUE-02: Implementasi Fondasi `src/core/` (`base`, `errors`, `types`, `utils`)

- **ID Issue:** `ISSUE-02`
- **Fase:** `1 - Database & Core Foundation`
- **Prioritas:** `P0 (Blocker)`
- **Bergantung Pada:** `ISSUE-01`
- **File Target (Sesuai Struktur Project):**
  - `src/core/base/Result.ts`
  - `src/core/base/BaseEntity.ts`
  - `src/core/base/BaseRepository.ts`
  - `src/core/base/BaseUseCase.ts`
  - `src/core/base/BaseService.ts`
  - `src/core/base/BaseController.ts`
  - `src/core/errors/AppError.ts`
  - `src/core/errors/DomainError.ts`
  - `src/core/errors/ApiError.ts`
  - `src/core/errors/OptimisticLockError.ts`
  - `src/core/errors/handleZodError.ts`
  - `src/core/types/ApiResponse.ts`
  - `src/core/types/PaginationDTO.ts`
  - `src/core/utils/HttpResultHandler.ts`
  - `src/core/utils/RouteParamHelper.ts`

## 1. Deskripsi Tugas
Membangun kontrak dasar Clean Architecture di `src/core/` agar seluruh modul (`auth`, `exams`, `attempts`, `proctor`, `users`) memiliki standar pengembalian `Result<T, AppError>`, penanganan *Optimistic Locking* (`syncVersion`), dan format respons JSON HTTP yang seragam.

## 2. Spesifikasi `src/core/base/Result.ts`
```typescript
import type { AppError } from '../errors/AppError';

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
      throw new Error('Cannot access value of a failed Result');
    }
    return this._value;
  }

  public get error(): E {
    if (this.isSuccess || this._error === undefined) {
      throw new Error('Cannot access error of a successful Result');
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
```

## 3. Kriteria Selesai (Definition of Done & TDD)
- [ ] Seluruh kelas abstrak di `src/core/base/` bebas dari penggunaan `any` dan lolos `npm run lint` (Biome).
- [ ] `HttpResultHandler.ts` memetakan `DomainError` (400/403), `OptimisticLockError` (409 Conflict), dan `ZodError` (422) ke `NextResponse.json()` dengan struktur `ApiResponse<T>`.
- [ ] Unit test `tests/unit/core/ResultAndHttpHandler.test.ts` lulus 100%.
