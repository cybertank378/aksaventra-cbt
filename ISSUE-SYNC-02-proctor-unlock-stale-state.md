# ⏱️ ISSUE-SYNC-02: *Stale State* saat Pengawas Melakukan *Unlock Strike* atau *Reset Device*

- **ID Issue:** `ISSUE-SYNC-02`
- **Prioritas:** `P1 (High)`
- **Modul & File Terdampak:**
  - `src/sections/exam-workspace/organisms/LockdownShieldModal.tsx`
  - `src/modules/proctor/application/usecases/UnlockParticipantStrikeUseCase.ts`
  - `src/modules/attempts/presentation/useExamWorkspaceStore.ts`

## 1. Akar Masalah (Root Cause)
Saat siswa terkena 3x *Strike*, layar siswa terkunci oleh `<LockdownShieldModal />` dan proses *auto-save* jawaban dihentikan. Ketika siswa melapor ke Pengawas dan Pengawas menekan tombol **Unlock Strike** di `/dashboard/proctor/[examId]`, layar siswa akan tetap terkunci jika siswa tidak memiliki mekanisme pendeteksi status pembukaan kunci atau jika siswa melakukan *refresh* namun `IndexedDB` lokal masih menyimpan `strikeCount: 3, status: 'locked'`.

## 2. Strategi Mitigasi Teknis (Heartbeat Polling on Locked State & Server-Authoritative Unlock)
1. Ketika `<LockdownShieldModal />` aktif (`status === 'locked'`), jalankan *lightweight status heartbeat* setiap **5 detik** ke `/api/attempts/[id]/sync`.
2. Berbeda dengan jawaban soal (di mana *client timestamp* yang paling baru menang), untuk properti `status`, `strikeCount`, dan `extraTimeSeconds`, **Server adalah satu-satunya sumber kebenaran mutlak (*Server-Authoritative*)**.
3. Begitu respons *heartbeat* menunjukkan `status === 'inprogress'` dan `strikeCount < maxStrikes`, aplikasi langsung memperbarui `useExamWorkspaceStore` dan `DexieAttemptVault`, menutup `<LockdownShieldModal />`, dan mengizinkan siswa melanjutkan ujian tanpa kehilangan satu pun jawaban yang tersimpan di lokal.

## 3. Cakupan Integration Test Wajib (`tests/integration/ProctorUnlockFlow.test.tsx`)
- `it('menutup LockdownShieldModal secara otomatis ketika heartbeat merespons status inprogress dan strikeCount = 0 dari server')`
