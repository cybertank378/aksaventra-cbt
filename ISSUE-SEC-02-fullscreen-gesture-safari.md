# 🛡️ ISSUE-SEC-02: Kegagalan `requestFullscreen()` karena Kebijakan *Transient User Activation* & iOS Safari

- **ID Issue:** `ISSUE-SEC-02`
- **Prioritas:** `P0 (Blocker)`
- **Modul & File Terdampak:**
  - `src/sections/student-lobby/molecules/TokenVerificationCard.tsx`
  - `src/security/quizFocusGuard.ts`

## 1. Akar Masalah (Root Cause)
1. Browser modern memblokir pemanggilan `document.documentElement.requestFullscreen()` jika dipanggil di dalam `useEffect` saat halaman dimuat atau *setelah* pemanggilan `await fetch()` validasi token yang memakan waktu > 1 detik (karena *user gesture token* sudah kedaluwarsa).
2. Browser Safari pada iPhone (iOS) tidak mendukung standar Fullscreen API pada elemen `<html>`, sehingga pemanggilan langsung tanpa pengecekan akan melempar `TypeError` dan menghentikan proses mulai ujian.

## 2. Strategi Mitigasi Teknis
1. **Synchronous Fullscreen First:** Pada `<TokenVerificationCard />`, saat siswa mengklik tombol **"Verifikasi Token & Mulai Ujian"**, panggil fungsi *fullscreen* secara sinkron **di baris pertama *event handler* `onClick`** sebelum melakukan `await verifyTokenApi()`. Jika token ternyata tidak valid, barulah panggil `document.exitFullscreen()`.
2. **Feature Detection & Viewport Fallback:** Periksa dukungan `document.fullscreenEnabled` atau `webkitRequestFullscreen`. Jika perangkat tidak mendukung *Fullscreen API* (dan ujian tidak mewajibkan SEB), aktifkan *Viewport Lock Mode* yang mendeteksi perubahan `window.visualViewport` untuk mencegah mode *Split-Screen* atau *Floating Window* di HP/Tablet.

## 3. Implementasi Kode (`quizFocusGuard.ts`)
```typescript
export async function enterExamFullscreenSafe(): Promise<'FULLSCREEN_ACTIVE' | 'VIEWPORT_FALLBACK'> {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };

  try {
    if (typeof el.requestFullscreen === 'function' && document.fullscreenEnabled) {
      await el.requestFullscreen();
      return 'FULLSCREEN_ACTIVE';
    }
    if (typeof el.webkitRequestFullscreen === 'function') {
      await el.webkitRequestFullscreen();
      return 'FULLSCREEN_ACTIVE';
    }
  } catch {
    // Fallback jika diblokir atau iOS Safari
  }
  return 'VIEWPORT_FALLBACK';
}
```

## 4. Cakupan Integration Test Wajib (`tests/integration/LobbyFullscreen.test.tsx`)
- `it('memanggil requestFullscreen secara sinkron sebelum request API verifikasi token selesai')`
- `it('mengembalikan VIEWPORT_FALLBACK tanpa melempar unhandled error pada lingkungan tanpa Fullscreen API')`
