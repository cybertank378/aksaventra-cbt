"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";
import type {
  ProctorChatMessageDTO,
  SendProctorChatInputDTO,
} from "../domain/dto/ProctorChatDTO";

export function useProctorChatApi(channelId = "GLOBAL", pollIntervalMs = 8000) {
  const [messages, setMessages] = useState<ProctorChatMessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await apiRequest<ProctorChatMessageDTO[]>(
        `/api/proctor/chat?channelId=${encodeURIComponent(channelId)}`,
        { method: "GET" },
      );
      const data = unwrapApiResponse(response);
      setMessages(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat pesan koordinasi pengawas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [channelId]);

  const sendMessage = useCallback(
    async (
      input: Omit<SendProctorChatInputDTO, "channelId">,
    ): Promise<boolean> => {
      setIsSending(true);
      setError(null);
      try {
        const response = await apiRequest<ProctorChatMessageDTO>(
          "/api/proctor/chat",
          {
            method: "POST",
            body: {
              ...input,
              channelId,
            },
          },
        );
        const created = unwrapApiResponse(response);
        if (created) {
          setMessages((prev) =>
            prev.some((m) => m.id === created.id) ? prev : [...prev, created],
          );
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal mengirim pesan.",
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [channelId],
  );

  useEffect(() => {
    let cancelled = false;
    let eventSource: EventSource | null = null;
    setIsLoading(true);
    setIsRealtimeConnected(false);

    const startFallbackPolling = () => {
      if (cancelled || pollTimerRef.current) return;
      const poll = async () => {
        if (cancelled) return;
        if (typeof document === "undefined" || !document.hidden) {
          await fetchMessages();
        }
        if (!cancelled) {
          pollTimerRef.current = setTimeout(() => {
            void poll();
          }, pollIntervalMs);
        }
      };
      void poll();
    };

    const stopFallbackPolling = () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    if (typeof EventSource !== "undefined") {
      eventSource = new EventSource(
        `/api/proctor/chat/stream?channelId=${encodeURIComponent(channelId)}`,
      );

      eventSource.addEventListener("open", () => {
        if (cancelled) return;
        setIsRealtimeConnected(true);
        setError(null);
        stopFallbackPolling();
      });

      eventSource.addEventListener("init", (event) => {
        if (cancelled) return;
        try {
          const initial = JSON.parse(
            (event as MessageEvent).data,
          ) as ProctorChatMessageDTO[];
          setMessages(Array.isArray(initial) ? initial : []);
          setIsLoading(false);
          setIsRealtimeConnected(true);
        } catch {
          setIsLoading(false);
        }
      });

      eventSource.addEventListener("message", (event) => {
        if (cancelled) return;
        try {
          const incoming = JSON.parse(
            (event as MessageEvent).data,
          ) as ProctorChatMessageDTO;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
          );
        } catch {
          // Ignore malformed event payload
        }
      });

      eventSource.addEventListener("cleared", () => {
        if (cancelled) return;
        setMessages([]);
      });

      eventSource.onerror = () => {
        if (cancelled) return;
        setIsRealtimeConnected(false);
        startFallbackPolling();
      };
    } else {
      startFallbackPolling();
    }

    return () => {
      cancelled = true;
      eventSource?.close();
      stopFallbackPolling();
    };
  }, [channelId, fetchMessages, pollIntervalMs]);

  return {
    messages,
    isLoading,
    isSending,
    isRealtimeConnected,
    error,
    sendMessage,
    refresh: fetchMessages,
  };
}
