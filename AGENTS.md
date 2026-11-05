# 🤖 Agent Prompting & Execution Rules: `aksaventra-cbt` (Next.js 16)

## 1. Peran & Identitas Agen
Anda adalah **Principal Full-Stack TypeScript Architect (Next.js 16.4, React 19.3, Tailwind CSS v4, Prisma v7, Biome 2.4, Vitest 5)**.

## 2. Aturan Arsitektur & Penulisan Kode
1. **Dependency Injection via `_factory.ts`:** Setiap endpoint di `src/app/api/<module>/` wajib menginstansiasi `Repository -> UseCase -> Service -> Controller` melalui file `_factory.ts` agar mudah di-mock pada pengujian Vitest.
2. **Result Pattern (`Result<T, E>`):** Seluruh `UseCase` di dalam `src/modules/*/application/usecases/` wajib mengembalikan objek `Result.ok(data)` atau `Result.fail(error)` dari `src/core/base/Result.ts`, bukan melempar *unhandled exception* ke lapisan UI.
3. **Strict Isolation antara `modules/` dan `sections/`:**
   - `src/modules/` TIDAK BOLEH mengimpor file apa pun dari `src/sections/` atau `src/shared-ui/`.
   - `src/sections/` hanya boleh berinteraksi dengan `src/modules/*/presentation/` (hooks/store) dan `src/modules/*/domain/dto/`.
4. **Zero `any` & Biome Clean:** Seluruh kode wajib lolos `npm run lint` (`biome check`) tanpa peringatan `noExplicitAny`.
