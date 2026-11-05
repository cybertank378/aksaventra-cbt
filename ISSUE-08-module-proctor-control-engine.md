# 📡 ISSUE-08: Implementasi Modul `src/modules/proctor/` (Real-Time Monitoring & Proctor Actions)

- **ID Issue:** `ISSUE-08`
- **Fase:** `2 - Domain & Application Modules`
- **Prioritas:** `P1 (High)`
- **Bergantung Pada:** `ISSUE-07`
- **File Target (Sesuai Struktur Project):**
  - `src/modules/proctor/domain/dto/ProctorActionDTO.ts`
  - `src/modules/proctor/domain/entities/ParticipantMonitorEntity.ts`
  - `src/modules/proctor/domain/interfaces/ProctorRepositoryInterface.ts`
  - `src/modules/proctor/application/usecases/GetRoomParticipantsUseCase.ts`
  - `src/modules/proctor/application/usecases/RotateRoomTokenUseCase.ts`
  - `src/modules/proctor/application/usecases/UnlockParticipantStrikeUseCase.ts`
  - `src/modules/proctor/application/usecases/ResetDeviceBindingUseCase.ts`
  - `src/modules/proctor/application/usecases/ExtendParticipantTimeUseCase.ts`
  - `src/modules/proctor/application/usecases/ForceSubmitAttemptUseCase.ts`
  - `src/modules/proctor/application/ProctorService.ts`
  - `src/modules/proctor/infrastructure/ProctorRepository.ts`
  - `src/modules/proctor/infrastructure/proctor.validator.ts`
  - `src/modules/proctor/infrastructure/ProctorController.ts`
  - `src/modules/proctor/presentation/useProctorStore.ts`
  - `src/modules/proctor/presentation/useProctorPolling.ts`
  - `src/app/api/proctor/[examId]/_factory.ts`
  - `src/app/api/proctor/[examId]/participants/route.ts`
  - `src/app/api/proctor/[examId]/rotate-token/route.ts`
  - `src/app/api/proctor/[examId]/action/route.ts`

## 1. Deskripsi Tugas
Membangun pusat kendali Pengawas Ujian:
1. **`GetRoomParticipantsUseCase.ts`:** Mengambil matriks peserta beserta jumlah soal terjawab, sisa waktu, jumlah pelanggaran (`strikeCount`), dan mendeteksi status `OFFLINE` secara otomatis jika `now - lastHeartbeatAt > 60 detik`.
2. **`RotateRoomTokenUseCase.ts`:** Menghasilkan token 6-karakter alfanumerik baru (tanpa karakter ambigu `0/O/1/I`) dengan masa berlaku 15 menit.
3. **Empat Aksi Proktor (`Unlock`, `ResetDevice`, `ExtendTime`, `ForceSubmit`):** Setiap aksi wajib mencatat jejak audit ke tabel `ViolationLog` dengan ID pengawas dan alasan tindakan.

## 2. Kriteria Selesai (Definition of Done & TDD)
- [ ] `tests/unit/modules/proctor/ProctorActionsUseCase.test.ts` memverifikasi bahwa `UnlockParticipantStrikeUseCase` mengubah status `LOCKED -> IN_PROGRESS`, mereset `strikeCount = 0`, dan membuat baris `ViolationLog`.
