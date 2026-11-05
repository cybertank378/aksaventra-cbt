# ⏱️ ISSUE-SYNC-01: Manipulasi Jam Sistem Operasi & Efek *Sleep / Hibernate* pada `setInterval`

- **ID Issue:** `ISSUE-SYNC-01`
- **Prioritas:** `P0 (Blocker)`
- **Modul & File Terdampak:**
  - `src/libs/serverDeltaTimer.ts`
  - `src/sections/exam-workspace/atoms/ServerTimerBadge.tsx`

## 1. Akar Masalah (Root Cause)
1. Siswa dapat memundurkan jam Windows/Android mereka 1 jam ke belakang di tengah ujian. Jika aplikasi menghitung sisa waktu hanya dengan `deadline - Date.now()`, siswa akan mendapat tambahan waktu ilegal.
2. Jika siswa menutup *lid* laptop (*sleep mode*) selama 15 menit lalu membukanya kembali, penghitung mundur berbasis `remainingSeconds--` di dalam `setInterval` akan tertinggal 15 menit dari waktu sebenarnya karena *timer thread* dibekukan saat *sleep*.

## 2. Strategi Mitigasi Teknis (Monotonic Clock + Server Offset Recalibration)
1. Gunakan `performance.now()` (jam monotonik sejak halaman dimuat yang **kebal terhadap perubahan jam OS oleh pengguna**) dikombinasikan dengan `serverTimestamp` saat *initial fetch* dan setiap respons *auto-save*.
2. Setiap kali `SyncAnswerQueueUseCase` menerima respons dari server (setiap ~20 detik), perbarui `anchor` dan `deadlineServerSec` (sehingga jika Pengawas memberikan **Tambah Waktu +10 Menit**, sisa waktu di layar siswa langsung bertambah secara otomatis tanpa perlu *refresh* halaman).

## 3. Implementasi Kode (`src/libs/serverDeltaTimer.ts`)
```typescript
export interface MonotonicTimeAnchor {
  serverTimestampSecAtSync: number;
  performanceNowMsAtSync: number;
}

export function calculateTrueRemainingSeconds(
  anchor: MonotonicTimeAnchor,
  deadlineServerSec: number,
  currentPerformanceNowMs: number
): number {
  const elapsedSecondsSinceSync = (currentPerformanceNowMs - anchor.performanceNowMsAtSync) / 1000;
  const estimatedServerNowSec = anchor.serverTimestampSecAtSync + elapsedSecondsSinceSync;
  return Math.max(0, Math.floor(deadlineServerSec - estimatedServerNowSec));
}
```

## 4. Cakupan Unit Test Wajib (`tests/unit/libs/ServerDeltaTimer.test.ts`)
- `it('menghitung sisa detik secara akurat berdasarkan performance.now() meskipun Date.now() dimundurkan 1 jam')`
- `it('langsung menyesuaikan sisa detik ketika deadlineServerSec diperpanjang oleh proktor')`
