# 🔐 ISSUE-05: Implementasi Modul `src/modules/auth/` & `src/modules/users/` beserta Endpoint API

- **ID Issue:** `ISSUE-05`
- **Fase:** `2 - Domain & Application Modules`
- **Prioritas:** `P0 (Blocker)`
- **Bergantung Pada:** `ISSUE-01`, `ISSUE-02`, `ISSUE-04`
- **File Target (Sesuai Struktur Project):**
  - `src/modules/auth/domain/dto/AuthDTO.ts`
  - `src/modules/auth/domain/entities/UserSessionEntity.ts`
  - `src/modules/auth/domain/interfaces/AuthRepositoryInterface.ts`
  - `src/modules/auth/domain/rules/SingleDeviceRule.ts`
  - `src/modules/auth/application/usecases/LoginUseCase.ts`
  - `src/modules/auth/application/usecases/LogoutUseCase.ts`
  - `src/modules/auth/application/usecases/VerifyExamTokenUseCase.ts`
  - `src/modules/auth/application/AuthService.ts`
  - `src/modules/auth/infrastructure/AuthRepository.ts`
  - `src/modules/auth/infrastructure/JwtProvider.ts`
  - `src/modules/auth/infrastructure/auth.validator.ts`
  - `src/modules/auth/infrastructure/AuthController.ts`
  - `src/modules/auth/presentation/useAuthApi.ts`
  - `src/app/api/auth/_factory.ts`
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/logout/route.ts`
  - `src/app/api/auth/verify-token/route.ts`
  - `src/modules/users/*` (Entity, Interface, UseCase, Service, Controller, Repository)

## 1. Deskripsi Tugas
Mengimplementasikan alur autentikasi peserta dan pengawas menggunakan `argon2` untuk verifikasi password dan `jose` untuk pembuatan *HTTP-only Session Cookie*, dilengkapi aturan **`SingleDeviceRule.ts`**:
- Jika peserta sudah memiliki sesi ujian aktif dengan `deviceHash` berbeda, tolak login perangkat baru dengan kode error `DEVICE_ALREADY_BOUND` kecuali Proktor telah menjalankan **Reset Device Binding**.
- `VerifyExamTokenUseCase.ts`: Memverifikasi token ruang 6-digit terhadap `exam.activeToken` dan `exam.tokenExpiresAt`.

## 2. Kriteria Selesai (Definition of Done & TDD)
- [ ] `tests/unit/modules/auth/SingleDeviceRule.test.ts` menguji pemblokiran login ganda di perangkat kedua.
- [ ] `tests/unit/modules/auth/VerifyExamTokenUseCase.test.ts` menguji token valid, token salah, dan token kedaluwarsa.
