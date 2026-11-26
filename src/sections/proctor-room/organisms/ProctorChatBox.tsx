"use client";

import clsx from "clsx";
import {
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldAlert,
} from "lucide-react";
import { type FC, type FormEvent, useEffect, useRef, useState } from "react";
import type { ProctorChatCategory } from "@/modules/proctor/domain/dto/ProctorChatDTO";
import { useProctorChatApi } from "@/modules/proctor/presentation/useProctorChatApi";
import type { UserRole } from "@/security/rbacConfig";
import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";

export interface ProctorChatBoxProps {
  channelId?: string;
  channelLabel?: string;
  roomCode?: string;
  className?: string;
}

const ROLE_BADGE_MAP: Record<UserRole, { label: string; color: BadgeColor }> = {
  ADMIN: { label: "Admin", color: "primary" },
  TEACHER: { label: "Guru", color: "teal" },
  PROCTOR: { label: "Pengawas", color: "gold" },
  STUDENT: { label: "Siswa", color: "neutral" },
};

const CATEGORY_OPTIONS: Array<{
  value: ProctorChatCategory;
  label: string;
  badgeColor: BadgeColor;
}> = [
  { value: "INFO", label: "Info", badgeColor: "teal" },
  { value: "ISSUE", label: "Kendala Ruang", badgeColor: "warning" },
  { value: "URGENT", label: "Mendesak", badgeColor: "error" },
];

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export const ProctorChatBox: FC<ProctorChatBoxProps> = ({
  channelId = "GLOBAL",
  channelLabel,
  roomCode,
  className,
}) => {
  const [activeChannel, setActiveChannel] = useState<string>(channelId);
  const [messageText, setMessageText] = useState("");
  const [category, setCategory] = useState<ProctorChatCategory>("INFO");
  const [roomInput, setRoomInput] = useState(roomCode || "");
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveChannel(channelId);
  }, [channelId]);

  useEffect(() => {
    if (roomCode) {
      setRoomInput(roomCode);
    }
  }, [roomCode]);

  const {
    messages,
    isLoading,
    isSending,
    isRealtimeConnected,
    error,
    sendMessage,
    refresh,
  } = useProctorChatApi(activeChannel);

  const prevCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || isSending) return;

    const ok = await sendMessage({
      message: trimmed,
      category,
      roomCode: roomInput.trim() || undefined,
    });
    if (ok) {
      setMessageText("");
    }
  };

  const hasRoomChannel = channelId !== "GLOBAL";

  return (
    <Card
      variant="elevated"
      className={clsx(
        "border border-slate-200/90 bg-white overflow-hidden",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d2b5c] text-white">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0d2b5c]">
                Chat Koordinasi Pengawas, Guru &amp; Admin
              </h3>
              <Badge
                color={isRealtimeConnected ? "success" : "warning"}
                variant="soft"
                size="sm"
              >
                {isRealtimeConnected ? "Live" : "Sinkronisasi"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              {activeChannel === "GLOBAL"
                ? "Kanal koordinasi semua ruang ujian (otomatis terhapus saat seluruh ujian selesai)"
                : `Kanal khusus sesi: ${channelLabel || activeChannel} (otomatis terhapus saat ujian selesai)`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasRoomChannel && (
            <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-0.5">
              <Button
                type="button"
                size="xs"
                variant={activeChannel === channelId ? "filled" : "ghost"}
                color={activeChannel === channelId ? "primary" : "secondary"}
                onClick={() => setActiveChannel(channelId)}
              >
                Sesi Ini
              </Button>
              <Button
                type="button"
                size="xs"
                variant={activeChannel === "GLOBAL" ? "filled" : "ghost"}
                color={activeChannel === "GLOBAL" ? "teal" : "secondary"}
                onClick={() => setActiveChannel("GLOBAL")}
              >
                Semua Ruang
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="xs"
            leftIcon={RefreshCw}
            onClick={() => void refresh()}
            disabled={isLoading}
          >
            Muat Ulang
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mx-5 mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="max-h-72 min-h-[180px] space-y-2.5 overflow-y-auto px-5 py-4">
        {isLoading && messages.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">
            Memuat riwayat pesan koordinasi...
          </p>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <MessageSquare className="mx-auto h-7 w-7 text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-slate-600">
              Belum ada pesan koordinasi pada kanal ini
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Sampaikan kendala teknis, permintaan reset peserta, atau status
              ruang ujian di sini agar segera ditindaklanjuti.
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const roleMeta = ROLE_BADGE_MAP[item.senderRole] ?? {
              label: item.senderRole,
              color: "neutral" as BadgeColor,
            };
            const catMeta = CATEGORY_OPTIONS.find(
              (c) => c.value === item.category,
            );

            return (
              <div
                key={item.id}
                className={clsx(
                  "rounded-2xl border p-3 text-xs",
                  item.category === "URGENT"
                    ? "border-rose-200 bg-rose-50/60"
                    : item.category === "ISSUE"
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-slate-200/80 bg-slate-50/60",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-slate-900">
                      {item.senderName}
                    </span>
                    <Badge color={roleMeta.color} variant="soft" size="sm">
                      {roleMeta.label}
                    </Badge>
                    {item.roomCode && (
                      <Badge color="neutral" variant="soft" size="sm">
                        Ruang {item.roomCode}
                      </Badge>
                    )}
                    {item.category !== "INFO" && catMeta && (
                      <Badge
                        color={catMeta.badgeColor}
                        variant="filled"
                        size="sm"
                      >
                        {item.category === "URGENT" && (
                          <ShieldAlert className="mr-1 inline h-3 w-3" />
                        )}
                        {catMeta.label}
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {formatTime(item.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-slate-700">
                  {item.message}
                </p>
              </div>
            );
          })
        )}
        <div ref={listEndRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 space-y-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="xs"
                variant={category === opt.value ? "filled" : "outline"}
                color={
                  category === opt.value
                    ? opt.value === "URGENT"
                      ? "danger"
                      : opt.value === "ISSUE"
                        ? "gold"
                        : "teal"
                    : "secondary"
                }
                onClick={() => setCategory(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Kode Ruang (mis. LAB-01)"
            aria-label="Kode ruang ujian"
            maxLength={40}
            className="h-8 w-44 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#0097a7] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Tulis laporan kendala ruang atau koordinasi dengan pengawas/guru/admin..."
            aria-label="Pesan koordinasi pengawas"
            maxLength={1000}
            disabled={isSending}
            className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0097a7] focus:outline-none"
          />
          <Button
            type="submit"
            variant="filled"
            color="primary"
            size="md"
            leftIcon={Send}
            loading={isSending}
            disabled={!messageText.trim() || isSending}
          >
            Kirim
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProctorChatBox;
