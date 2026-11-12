"use client";

import { Lock, LogIn, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FC, type FormEvent, useState } from "react";
import { useAuthApi } from "@/modules/auth/presentation/useAuthApi";
import { generateDeviceFingerprint } from "@/security/deviceFingerprint";
import {
  getDefaultRedirectForRole,
  type UserRole,
} from "@/security/rbacConfig";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import TextField from "@/shared-ui/component/TextField";

export interface LoginFormProps {
  onSuccess?: (user: {
    id: number | string;
    username: string;
    role: UserRole;
  }) => void;
  defaultExamId?: string;
}

export const LoginForm: FC<LoginFormProps> = ({ onSuccess, defaultExamId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examIdParam = defaultExamId || searchParams.get("examId") || undefined;

  const { login, isLoading, error: authError } = useAuthApi();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLocalError("Username dan password wajib diisi");
      return;
    }

    setLocalError(null);

    try {
      // Collect device fingerprint binding
      const deviceHash = await generateDeviceFingerprint();

      const result = await login({
        username: username.trim(),
        password,
        deviceHash,
        examId: examIdParam,
      });

      const user = result.user;

      if (onSuccess) {
        onSuccess(user);
      } else {
        const role = (user.role as UserRole) || "STUDENT";
        if (role === "STUDENT" && examIdParam) {
          router.replace(`/student/lobby/${examIdParam}`);
        } else {
          const redirectPath = getDefaultRedirectForRole(role);
          router.replace(redirectPath);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal masuk ke sistem";
      setLocalError(message);
    }
  };

  const displayedError = localError || authError;

  return (
    <Card
      variant="elevated"
      className="w-full max-w-md border border-slate-200/80 bg-white shadow-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-1.5 text-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0d2b5c]">
            Masuk Aksaventra CBT
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Gunakan akun siswa atau pengawas untuk memulai sesi ujian
          </p>
        </div>

        {displayedError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 animate-in fade-in"
          >
            <span className="font-bold shrink-0">⚠️ Error:</span>
            <span>{displayedError}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <TextField
            id="username-input"
            label="Username / NISN"
            placeholder="Masukkan username atau nomor induk..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (localError) setLocalError(null);
            }}
            disabled={isLoading}
            leftIcon={User}
            autoComplete="username"
            required
          />

          <TextField
            id="password-input"
            label="Kata Sandi (Password)"
            type="password"
            placeholder="Masukkan kata sandi..."
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (localError) setLocalError(null);
            }}
            disabled={isLoading}
            leftIcon={Lock}
            enablePasswordToggle
            autoComplete="current-password"
            required
          />
        </div>

        <Button
          type="submit"
          variant="filled"
          color="primary"
          size="md"
          fullWidth
          loading={isLoading}
          leftIcon={LogIn}
          className="mt-2"
        >
          {isLoading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}
        </Button>
      </form>
    </Card>
  );
};

export default LoginForm;
