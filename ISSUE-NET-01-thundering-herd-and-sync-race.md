# 🌐 ISSUE-NET-01: *Thundering Herd* & *Race Condition* antara *Auto-Save* Berkala dan Klik Tombol "Kumpulkan Ujian"

- **ID Issue:** `ISSUE-NET-01`
- **Prioritas:** `P0 (Blocker)`
- **Modul & File Terdampak:**
  - `src/modules/attempts/application/usecases/SyncAnswerQueueUseCase.ts`
  - `src/modules/attempts/application/usecases/SubmitAttemptUseCase.ts`
  - `src/modules/attempts/presentation/useAttemptSyncHook.ts`
  - `src/shared/api/apiQueue.ts`

## 1. Akar Masalah (Root Cause)
1. **Thundering Herd:** Jika 500 siswa memulai ujian pada detik yang sama dan memiliki *interval auto-save* statis `20000ms`, maka setiap kelipatan 20 detik server akan dihantam 500 *request* serentak.
2. **In-Flight Sync vs Final Submit Race Condition:** Siswa mengubah jawaban soal nomor 40 pada detik ke-19, lalu menekan tombol **"Kumpulkan Ujian"** pada detik ke-20 tepat saat *Background Auto-Save* sedang dalam perjalanan (*in-flight*). Jika *request* `submit` selesai lebih dulu di server daripada `sync`, maka jawaban nomor 40 gagal tersimpan karena status attempt sudah berubah menjadi `submitted`.

## 2. Strategi Mitigasi Teknis (Mutex Lock + Random Jitter Scheduler)
1. **Random Jitter Wajib (`0 - 4000ms`):** Setiap siklus *auto-save* menggunakan `setTimeout` rekursif dengan jeda `20000 + Math.floor(Math.random() * 4000)`.
2. **Async Mutex Barrier (`apiQueue.ts`):** `SyncAnswerQueueUseCase` dan `SubmitAttemptUseCase` dieksekusi di dalam satu antrean *Sequential Mutex*. Saat `SubmitAttemptUseCase` dipanggil:
   - Hentikan timer *auto-save* berikutnya.
   - Tunggu hingga *in-flight sync* yang sedang berjalan selesai (`await mutex.waitForUnlock()`).
   - Ambil seluruh sisa jawaban dengan `synced: false` dari `DexieAttemptVault` dan sertakan langsung di dalam *payload* final `submit`.

## 3. Implementasi Kode (`src/shared/api/apiQueue.ts`)
```typescript
export function getNextSyncDelayWithJitter(baseMs = 20000, maxJitterMs = 4000): number {
  return baseMs + Math.floor(Math.random() * (maxJitterMs + 1));
}

export class AsyncSyncMutex {
  private currentPromise: Promise<unknown> = Promise.resolve();

  public runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const nextTask = this.currentPromise.then(task, task);
    this.currentPromise = nextTask.catch(() => undefined);
    return nextTask;
  }
}
```

## 4. Cakupan Unit Test Wajib (`tests/unit/usecases/SyncMutexAndJitter.test.ts`)
- `it('menghasilkan delay acak di rentang 20000ms hingga 24000ms')`
- `it('menjamin SubmitAttemptUseCase menunggu SyncAnswerQueueUseCase yang sedang in-flight selesai terlebih dahulu')`
