# 🗂️ Indeks Issue & Mitigasi Teknis (`aksaventra-cbt` - Next.js 16)

Seluruh daftar issue pada aplikasi **Next.js 16 Modular Clean Architecture** dipecah menjadi file individual per skenario agar mudah dilacak pada proses pengembangan dan pengujian TDD (Vitest):

## 1. Security & Anti-Cheat (`ISSUE-SEC-*`)
- [`ISSUE-SEC-01-false-positive-blur-strike.md`](./ISSUE-SEC-01-false-positive-blur-strike.md) — False-Positive Strike Akibat Notifikasi OS / Low-Battery Pop-up
- [`ISSUE-SEC-02-fullscreen-gesture-safari.md`](./ISSUE-SEC-02-fullscreen-gesture-safari.md) — Kegagalan `requestFullscreen()` karena *Transient User Activation* & iOS Safari
- [`ISSUE-SEC-03-keyboard-shortcut-collision.md`](./ISSUE-SEC-03-keyboard-shortcut-collision.md) — Konflik Pintasan Keyboard (`A-E`, `R`, Panah) pada Input Soal `shortanswer`
- [`ISSUE-SEC-04-seb-header-spoofing.md`](./ISSUE-SEC-04-seb-header-spoofing.md) — Bypass Validasi Safe Exam Browser (SEB) via *Client-Side Header Spoofing*

## 2. Offline-First, IndexedDB & Concurrency (`ISSUE-NET-*`)
- [`ISSUE-NET-01-thundering-herd-and-sync-race.md`](./ISSUE-NET-01-thundering-herd-and-sync-race.md) — *Thundering Herd* & *Race Condition* antara *Auto-Save* dan Klik "Kumpulkan Ujian"
- [`ISSUE-NET-02-indexeddb-rehydration-conflict.md`](./ISSUE-NET-02-indexeddb-rehydration-conflict.md) — Rehidrasi Jawaban saat Siswa Menekan Refresh (`F5`) atau Listrik Mati
- [`ISSUE-NET-03-offline-timeout-sealed-receipt.md`](./ISSUE-NET-03-offline-timeout-sealed-receipt.md) — Waktu Ujian Habis (`remainingSeconds === 0`) Saat Wi-Fi / LAN Terputus Total

## 3. Zero-Latency Workspace & Performance (`ISSUE-PERF-*`)
- [`ISSUE-PERF-01-timer-rerender-cascade.md`](./ISSUE-PERF-01-timer-rerender-cascade.md) — *Re-render Cascade* Setiap Detik Akibat Countdown Timer
- [`ISSUE-PERF-02-katex-dompurify-corruption.md`](./ISSUE-PERF-02-katex-dompurify-corruption.md) — Korupsi Sintaks LaTeX/KaTeX Akibat Sanitasi `DOMPurify` & *Main-Thread Blocking*
- [`ISSUE-PERF-03-zod-moodle-payload-coercion.md`](./ISSUE-PERF-03-zod-moodle-payload-coercion.md) — Kegagalan Validasi Skema `Zod` Akibat Inkonkonsistensi Tipe Data JSON dari PHP Moodle

## 4. Timer Manipulation & Proctor Synchronization (`ISSUE-SYNC-*`)
- [`ISSUE-SYNC-01-os-clock-manipulation-sleep.md`](./ISSUE-SYNC-01-os-clock-manipulation-sleep.md) — Manipulasi Jam Sistem Operasi & Efek *Laptop Sleep / Hibernate*
- [`ISSUE-SYNC-02-proctor-unlock-stale-state.md`](./ISSUE-SYNC-02-proctor-unlock-stale-state.md) — *Stale State* saat Pengawas Melakukan *Unlock Strike* atau *Reset Device*
