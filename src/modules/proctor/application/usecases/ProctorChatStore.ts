import "server-only";

import { prisma } from "@/libs/prisma";
import { getRedisClient, getRedisSubscriber } from "@/libs/redis";
import type { UserRole } from "@/security/rbacConfig";
import type {
  ProctorChatCategory,
  ProctorChatMessageDTO,
} from "../../domain/dto/ProctorChatDTO";

const MAX_MESSAGES_PER_CHANNEL = 300;
const REDIS_CHAT_TTL_SECONDS = 86_400; // 24 hours max safety TTL

export type ProctorChatStreamEvent =
  | { type: "message"; payload: ProctorChatMessageDTO }
  | { type: "cleared"; channelId: string; reason: string };

type ChannelListener = (event: ProctorChatStreamEvent) => void;

type GlobalChatStore = {
  __aksaventraProctorChat?: Map<string, ProctorChatMessageDTO[]>;
  __aksaventraProctorChatListeners?: Map<string, Set<ChannelListener>>;
  __aksaventraRedisSubBound?: boolean;
};

function redisListKey(channelId: string): string {
  return `proctor:chat:list:${channelId}`;
}

function redisPubSubChannel(channelId: string): string {
  return `proctor:chat:events:${channelId}`;
}

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

function emitLocalChannelEvent(
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

function ensureRedisSubscriberBound(): void {
  const sub = getRedisSubscriber();
  if (!sub) return;

  const g = globalThis as unknown as GlobalChatStore;
  if (g.__aksaventraRedisSubBound) return;
  g.__aksaventraRedisSubBound = true;

  sub.on("message", (channel: string, rawPayload: string) => {
    const prefix = "proctor:chat:events:";
    if (!channel.startsWith(prefix)) return;
    const channelId = channel.slice(prefix.length);
    try {
      const event = JSON.parse(rawPayload) as ProctorChatStreamEvent;
      emitLocalChannelEvent(channelId, event);
    } catch {
      // Ignore malformed pub/sub message
    }
  });
}

async function publishChannelEvent(
  channelId: string,
  event: ProctorChatStreamEvent,
): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.publish(redisPubSubChannel(channelId), JSON.stringify(event));
      return;
    } catch {
      // Fallback to local delivery if Redis publish fails
    }
  }
  emitLocalChannelEvent(channelId, event);
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
  const isFirstSubscriber = !set || set.size === 0;
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(listener);

  const sub = getRedisSubscriber();
  if (sub && isFirstSubscriber) {
    ensureRedisSubscriberBound();
    void sub.subscribe(redisPubSubChannel(key)).catch(() => undefined);
  }

  return () => {
    set?.delete(listener);
    if (set && set.size === 0) {
      map.delete(key);
      if (sub) {
        void sub.unsubscribe(redisPubSubChannel(key)).catch(() => undefined);
      }
    }
  };
}

export async function clearProctorChatChannel(
  channelId: string,
  reason = "Sesi ujian telah selesai",
): Promise<boolean> {
  const key = normalizeChannelId(channelId);
  const redis = getRedisClient();

  if (redis) {
    try {
      const deleted = await redis.del(redisListKey(key));
      if (deleted > 0) {
        await publishChannelEvent(key, {
          type: "cleared",
          channelId: key,
          reason,
        });
        return true;
      }
      return false;
    } catch {
      // Fall through to local map cleanup
    }
  }

  const map = getChannelMap();
  const hadMessages = (map.get(key)?.length ?? 0) > 0;
  map.delete(key);
  if (hadMessages) {
    emitLocalChannelEvent(key, { type: "cleared", channelId: key, reason });
  }
  return hadMessages;
}

/**
 * Checks whether the exam associated with `channelId` has finished (`timeClose <= now`).
 * If finished, clears the channel messages across all workers and returns `true`.
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
        await clearProctorChatChannel(
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
      await clearProctorChatChannel(key, "Waktu sesi ujian telah berakhir");
      return true;
    }
  } catch {
    // Do not fail chat read if DB check temporarily fails
  }

  return false;
}

export async function listProctorChatMessages(
  channelId: string,
): Promise<ProctorChatMessageDTO[]> {
  const key = normalizeChannelId(channelId);
  const redis = getRedisClient();

  if (redis) {
    try {
      const rawItems = await redis.lrange(redisListKey(key), 0, -1);
      return rawItems
        .map((item) => {
          try {
            return JSON.parse(item) as ProctorChatMessageDTO;
          } catch {
            return null;
          }
        })
        .filter((item): item is ProctorChatMessageDTO => item !== null);
    } catch {
      // Fallback to local memory store
    }
  }

  const map = getChannelMap();
  return [...(map.get(key) ?? [])];
}

export async function appendProctorChatMessage(params: {
  channelId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  roomCode?: string | null;
  category?: ProctorChatCategory;
  message: string;
}): Promise<ProctorChatMessageDTO> {
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

  const redis = getRedisClient();
  if (redis) {
    try {
      const listKey = redisListKey(key);
      await redis
        .multi()
        .rpush(listKey, JSON.stringify(entry))
        .ltrim(listKey, -MAX_MESSAGES_PER_CHANNEL, -1)
        .expire(listKey, REDIS_CHAT_TTL_SECONDS)
        .exec();
      await publishChannelEvent(key, { type: "message", payload: entry });
      return entry;
    } catch {
      // Fallback to local memory store
    }
  }

  const map = getChannelMap();
  const existing = map.get(key) ?? [];
  existing.push(entry);
  if (existing.length > MAX_MESSAGES_PER_CHANNEL) {
    existing.splice(0, existing.length - MAX_MESSAGES_PER_CHANNEL);
  }
  map.set(key, existing);

  emitLocalChannelEvent(key, { type: "message", payload: entry });

  return entry;
}
