import "server-only";

import { prisma } from "@/libs/prisma";
import type { UserRole } from "@/security/rbacConfig";
import type {
  ProctorChatCategory,
  ProctorChatMessageDTO,
} from "../../domain/dto/ProctorChatDTO";

const MAX_MESSAGES_PER_CHANNEL = 300;

export type ProctorChatStreamEvent =
  | { type: "message"; payload: ProctorChatMessageDTO }
  | { type: "cleared"; channelId: string; reason: string };

type ChannelListener = (event: ProctorChatStreamEvent) => void;

type GlobalChatStore = {
  __aksaventraProctorChat?: Map<string, ProctorChatMessageDTO[]>;
  __aksaventraProctorChatListeners?: Map<string, Set<ChannelListener>>;
};

function getChannelMap(): Map<string, ProctorChatMessageDTO[]> {
  const g = globalThis as unknown as GlobalChatStore;
  if (!g.__aksaventraProctorChat) {
    g.__aksaventraProctorChat = new Map();
  }
  return g.__aksaventraProctorChat;
}

function getListenerMap(): Map<string, Set<ChannelListener>> {
  const g = globalThis as unknown as GlobalChatStore;
  if (!g.__aksaventraProctorChatListeners) {
    g.__aksaventraProctorChatListeners = new Map();
  }
  return g.__aksaventraProctorChatListeners;
}

function emitChannelEvent(
  channelId: string,
  event: ProctorChatStreamEvent,
): void {
  const listeners = getListenerMap().get(channelId);
  if (!listeners || listeners.size === 0) return;
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // Ignore individual subscriber delivery errors
    }
  }
}

export function normalizeChannelId(raw?: string | null): string {
  const trimmed = raw?.trim();
  if (!trimmed) return "GLOBAL";
  return trimmed.slice(0, 80);
}

export function subscribeProctorChat(
  channelId: string,
  listener: ChannelListener,
): () => void {
  const key = normalizeChannelId(channelId);
  const map = getListenerMap();
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(listener);

  return () => {
    set?.delete(listener);
    if (set && set.size === 0) {
      map.delete(key);
    }
  };
}

export function clearProctorChatChannel(
  channelId: string,
  reason = "Sesi ujian telah selesai",
): boolean {
  const key = normalizeChannelId(channelId);
  const map = getChannelMap();
  const hadMessages = (map.get(key)?.length ?? 0) > 0;
  map.delete(key);
  if (hadMessages) {
    emitChannelEvent(key, { type: "cleared", channelId: key, reason });
  }
  return hadMessages;
}

/**
 * Checks whether the exam associated with `channelId` has finished (`timeClose <= now`).
 * If finished, clears the channel messages automatically and returns `true`.
 */
export async function purgeChannelIfExamEnded(
  channelId: string,
): Promise<boolean> {
  const key = normalizeChannelId(channelId);
  const now = new Date();

  try {
    if (key === "GLOBAL") {
      const openExamsCount = await prisma.exam.count({
        where: { timeClose: { gt: now } },
      });
      if (openExamsCount === 0) {
        clearProctorChatChannel(
          "GLOBAL",
          "Seluruh sesi ujian aktif telah selesai",
        );
        return true;
      }
      return false;
    }

    const exam = await prisma.exam.findUnique({
      where: { id: key },
      select: { timeClose: true },
    });

    if (exam && exam.timeClose <= now) {
      clearProctorChatChannel(key, "Waktu sesi ujian telah berakhir");
      return true;
    }
  } catch {
    // Do not fail chat read if DB check temporarily fails
  }

  return false;
}

export function listProctorChatMessages(
  channelId: string,
): ProctorChatMessageDTO[] {
  const map = getChannelMap();
  const key = normalizeChannelId(channelId);
  return [...(map.get(key) ?? [])];
}

export function appendProctorChatMessage(params: {
  channelId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  roomCode?: string | null;
  category?: ProctorChatCategory;
  message: string;
}): ProctorChatMessageDTO {
  const map = getChannelMap();
  const key = normalizeChannelId(params.channelId);

  const entry: ProctorChatMessageDTO = {
    id: crypto.randomUUID(),
    channelId: key,
    senderId: params.senderId,
    senderName: params.senderName,
    senderRole: params.senderRole,
    roomCode: params.roomCode?.trim() || null,
    category: params.category ?? "INFO",
    message: params.message.trim(),
    createdAt: new Date().toISOString(),
  };

  const existing = map.get(key) ?? [];
  existing.push(entry);
  if (existing.length > MAX_MESSAGES_PER_CHANNEL) {
    existing.splice(0, existing.length - MAX_MESSAGES_PER_CHANNEL);
  }
  map.set(key, existing);

  emitChannelEvent(key, { type: "message", payload: entry });

  return entry;
}
