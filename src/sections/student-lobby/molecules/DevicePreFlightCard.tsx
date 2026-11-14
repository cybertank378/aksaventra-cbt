"use client";

import {
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Monitor,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  XCircle,
} from "lucide-react";
import { type FC, useCallback, useEffect, useState } from "react";
import { vault } from "@/libs/dexieVault";
import { apiRequest } from "@/shared/api/apiRequest";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";

export type CheckStatus =
  | "PENDING"
  | "CHECKING"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export interface PreFlightItem {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  detailMessage?: string;
  isCritical: boolean;
}

export interface DevicePreFlightCardProps {
  onReadyChange?: (isReady: boolean) => void;
  className?: string;
}

export const DevicePreFlightCard: FC<DevicePreFlightCardProps> = ({
  onReadyChange,
  className,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [checks, setChecks] = useState<Record<string, PreFlightItem>>({
    storage: {
      id: "storage",
      name: "Penyimpanan Offline (IndexedDB)",
      description: "Memastikan jawaban ujian tersimpan aman saat offline",
      status: "PENDING",
      isCritical: true,
    },
    network: {
      id: "network",
      name: "Koneksi Server CBT",
      description: "Memeriksa stabilitas jaringan dan latensi server",
      status: "PENDING",
      isCritical: true,
    },
    screen: {
      id: "screen",
      name: "Resolusi Layar Perangkat",
      description: "Ukuran viewport minimal yang disarankan (1024x600)",
      status: "PENDING",
      isCritical: false,
    },
  });

  const runAllChecks = useCallback(async () => {
    setIsRunning(true);

    // 1. Storage Check (IndexedDB write & read test)
    setChecks((prev) => ({
      ...prev,
      storage: { ...prev.storage, status: "CHECKING" },
    }));

    let storageSuccess = false;
    let storageDetail = "";

    try {
      if (typeof window === "undefined" || !window.indexedDB) {
        throw new Error("IndexedDB tidak didukung oleh browser Anda");
      }
      const testAttemptId = "preflight_test";
      const testQuestionId = 999999;
      await vault.saveAnswer(testAttemptId, testQuestionId, "test_payload");
      const readRecord = await vault.getAllAnswers(testAttemptId);
      await vault.clearAttempt(testAttemptId);

      if (readRecord && readRecord.length > 0) {
        storageSuccess = true;
        storageDetail = "IndexedDB Aktif & Siap Simpan Offline";
      } else {
        throw new Error("Verifikasi pembacaan penyimpanan lokal gagal");
      }
    } catch (err) {
      storageSuccess = false;
      storageDetail =
        err instanceof Error
          ? err.message
          : "Penyimpanan browser diblokir (periksa mode Incognito)";
    }

    setChecks((prev) => ({
      ...prev,
      storage: {
        ...prev.storage,
        status: storageSuccess ? "SUCCESS" : "ERROR",
        detailMessage: storageDetail,
      },
    }));

    // 2. Network & Latency Check
    setChecks((prev) => ({
      ...prev,
      network: { ...prev.network, status: "CHECKING" },
    }));

    let networkStatus: CheckStatus = "CHECKING";
    let networkDetail = "";

    try {
      const startTime = performance.now();
      const res = await apiRequest<{ status: string }>("/api/health");
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (res.success) {
        networkStatus = latencyMs > 1500 ? "WARNING" : "SUCCESS";
        networkDetail = `Terhubung (Latensi: ${latencyMs} ms)`;
      } else {
        networkStatus = "ERROR";
        networkDetail = "Respons server tidak valid";
      }
    } catch (_err) {
      networkStatus = "ERROR";
      networkDetail = "Koneksi ke server CBT terputus";
    }

    setChecks((prev) => ({
      ...prev,
      network: {
        ...prev.network,
        status: networkStatus,
        detailMessage: networkDetail,
      },
    }));

    // 3. Screen Check
    const screenWidth =
      typeof window !== "undefined" ? window.screen.width : 1280;
    const screenHeight =
      typeof window !== "undefined" ? window.screen.height : 720;
    const isAdequate = screenWidth >= 1024 && screenHeight >= 600;

    setChecks((prev) => ({
      ...prev,
      screen: {
        ...prev.screen,
        status: isAdequate ? "SUCCESS" : "WARNING",
        detailMessage: `${screenWidth} × ${screenHeight} px ${isAdequate ? "(Sesuai)" : "(Disarankan minimal 1024x600)"}`,
      },
    }));

    setIsRunning(false);
  }, []);

  useEffect(() => {
    runAllChecks();
  }, [runAllChecks]);

  // Evaluate readiness whenever checks change
  useEffect(() => {
    const list = Object.values(checks);
    const hasPendingOrChecking = list.some(
      (c) => c.status === "PENDING" || c.status === "CHECKING",
    );
    const hasCriticalError = list.some(
      (c) => c.isCritical && c.status === "ERROR",
    );

    const isReady = !hasPendingOrChecking && !hasCriticalError;
    onReadyChange?.(isReady);
  }, [checks, onReadyChange]);

  const allItems = Object.values(checks);
  const isAllReady = allItems.every((item) =>
    item.isCritical
      ? item.status === "SUCCESS" || item.status === "WARNING"
      : true,
  );

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case "CHECKING":
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0097a7]" />
        );
      case "SUCCESS":
        return <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />;
      case "WARNING":
        return <AlertTriangle size={18} className="text-amber-500 shrink-0" />;
      case "ERROR":
        return <XCircle size={18} className="text-rose-600 shrink-0" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-slate-300" />;
    }
  };

  const getCheckIcon = (id: string) => {
    switch (id) {
      case "storage":
        return <HardDrive size={18} className="text-[#0d2b5c]" />;
      case "network":
        return <Wifi size={18} className="text-[#0097a7]" />;
      case "screen":
        return <Monitor size={18} className="text-slate-600" />;
      default:
        return null;
    }
  };

  return (
    <Card
      variant="default"
      title="Pemeriksaan Kesiapan Perangkat (Pre-Flight Check)"
      subtitle="Sistem secara otomatis menguji kesiapan browser, memori, dan koneksi"
      headerRight={
        <Button
          variant="outline"
          color="secondary"
          size="sm"
          onClick={runAllChecks}
          loading={isRunning}
          leftIcon={RefreshCw}
        >
          Uji Ulang
        </Button>
      }
      className={className}
    >
      <div className="flex flex-col gap-3 p-4 sm:p-6">
        {/* Readiness Summary Banner */}
        <div
          className={`flex items-center justify-between rounded-xl border p-4 ${
            isAllReady
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
              : "border-rose-200 bg-rose-50/70 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {isAllReady ? (
              <ShieldCheck size={24} className="text-emerald-600" />
            ) : (
              <ShieldAlert size={24} className="text-rose-600" />
            )}
            <div>
              <p className="text-sm font-bold">
                {isAllReady
                  ? "Semua Sistem Siap untuk Ujian"
                  : "Perangkat Belum Memenuhi Syarat Ujian"}
              </p>
              <p className="text-xs opacity-80">
                {isAllReady
                  ? "Perangkat Anda telah lolos pemeriksaan offline storage dan koneksi."
                  : "Terdapat pemeriksaan kritis yang gagal. Perbaiki sebelum memasukkan token."}
              </p>
            </div>
          </div>
          <Badge
            color={isAllReady ? "success" : "error"}
            variant="filled"
            size="sm"
          >
            {isAllReady ? "STATUS: SIAP" : "STATUS: BELUM SIAP"}
          </Badge>
        </div>

        {/* Checklist Rows */}
        <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-2">
          {allItems.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 transition-colors hover:bg-white"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                  {getCheckIcon(check.id)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {check.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {check.detailMessage || check.description}
                  </p>
                </div>
              </div>
              <div className="shrink-0 pl-2">{getStatusIcon(check.status)}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DevicePreFlightCard;
