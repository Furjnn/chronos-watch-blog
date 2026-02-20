"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConnectionStateChange, InboundMessage, Realtime, RealtimeChannel } from "ably";
import {
  ADMIN_CHAT_CHANNEL,
  ADMIN_CHAT_FETCH_LIMIT,
  ADMIN_CHAT_MAX_MESSAGE_LENGTH,
  type AdminChatMessagePayload,
} from "@/lib/admin-chat";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mergeUniqueById(
  current: AdminChatMessagePayload[],
  incoming: AdminChatMessagePayload[],
) {
  const map = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) {
    if (!item?.id) continue;
    map.set(item.id, item);
  }
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function parseInitials(name: string) {
  const source = name.trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || source[0].toUpperCase();
}

export default function AdminChatClient({
  currentUserId,
  currentUserName,
  initialMessages,
  realtimeEnabled,
}: {
  currentUserId: string;
  currentUserName: string;
  initialMessages: AdminChatMessagePayload[];
  realtimeEnabled: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length >= ADMIN_CHAT_FETCH_LIMIT);
  const [error, setError] = useState("");
  const [realtimeState, setRealtimeState] = useState("inactive");
  const [realtimeError, setRealtimeError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const realtimeRef = useRef<Realtime | null>(null);

  const oldestMessageDate = useMemo(
    () => (messages.length > 0 ? messages[0].createdAt : null),
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!realtimeEnabled) {
      setRealtimeState("disabled");
      return;
    }

    let cancelled = false;

    const setupRealtime = async () => {
      try {
        const imported = await import("ably");
        const AblyModule = (imported.default ?? imported) as typeof import("ably");
        if (cancelled) return;

        const realtime = new AblyModule.Realtime({
          authUrl: "/api/admin/chat/token",
          authMethod: "GET",
          closeOnUnload: true,
        });
        realtimeRef.current = realtime;
        setRealtimeState(realtime.connection.state || "connecting");

        realtime.connection.on((stateChange: ConnectionStateChange) => {
          if (cancelled) return;
          setRealtimeState(stateChange.current);
        });

        const channel = realtime.channels.get(ADMIN_CHAT_CHANNEL);
        channelRef.current = channel;
        await channel.subscribe("message.created", (event: InboundMessage) => {
          if (cancelled) return;
          const payload = event.data as AdminChatMessagePayload | undefined;
          if (!payload?.id) return;
          setMessages((prev) => mergeUniqueById(prev, [payload]));
        });
      } catch (setupError) {
        const message =
          setupError instanceof Error ? setupError.message : "Realtime baglantisi kurulamadı.";
        if (!cancelled) {
          setRealtimeState("failed");
          setRealtimeError(message);
        }
      }
    };

    setupRealtime();

    return () => {
      cancelled = true;
      try {
        channelRef.current?.unsubscribe();
      } catch {
        // noop
      }
      try {
        realtimeRef.current?.close();
      } catch {
        // noop
      }
      channelRef.current = null;
      realtimeRef.current = null;
    };
  }, [realtimeEnabled]);

  const loadOlder = useCallback(async () => {
    if (!oldestMessageDate || loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    setError("");
    try {
      const query = new URLSearchParams({
        limit: String(ADMIN_CHAT_FETCH_LIMIT),
        before: oldestMessageDate,
      });
      const res = await fetch(`/api/admin/chat/messages?${query.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Mesajlar yuklenemedi (${res.status}).`);
        return;
      }

      const items = Array.isArray(data.items) ? (data.items as AdminChatMessagePayload[]) : [];
      setMessages((prev) => mergeUniqueById(prev, items));
      if (items.length < ADMIN_CHAT_FETCH_LIMIT) {
        setHasMore(false);
      }
    } finally {
      setLoadingOlder(false);
    }
  }, [oldestMessageDate, loadingOlder, hasMore]);

  const sendMessage = useCallback(async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Mesaj gonderilemedi (${res.status}).`);
        return;
      }
      const payload = data.message as AdminChatMessagePayload;
      if (payload?.id) {
        setMessages((prev) => mergeUniqueById(prev, [payload]));
      }
      setText("");
    } finally {
      setSending(false);
    }
  }, [text, sending]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-[28px] font-semibold text-slate-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admin Chat
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Admin ve editorler arasinda anlik ekip iletisimi.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600">
          Realtime:{" "}
          <span className="font-semibold uppercase tracking-wide">
            {realtimeState}
          </span>
        </div>
      </div>

      {!realtimeEnabled ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Realtime su an kapali. `ABLY_API_KEY` ekleyince chat anlik calisir.
        </div>
      ) : null}
      {realtimeError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          {realtimeError}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="text-[12px] text-slate-500">
            Toplam mesaj: <span className="font-semibold text-slate-700">{messages.length}</span>
          </div>
          <button
            onClick={loadOlder}
            disabled={!hasMore || loadingOlder}
            className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-[12px] font-medium text-slate-600 disabled:opacity-50 cursor-pointer"
          >
            {loadingOlder ? "Yukleniyor..." : hasMore ? "Daha eski mesajlar" : "Tum mesajlar yuklendi"}
          </button>
        </div>

        <div className="h-[58vh] overflow-y-auto px-4 py-4 space-y-3 bg-[#F8FAFC]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[13px] text-slate-400">
              Henuz mesaj yok. Ilk mesaji gonderebilirsin.
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.senderUserId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 border ${
                      mine
                        ? "bg-[#B8956A] text-white border-[#B8956A]"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {message.senderAvatar ? (
                        <img
                          src={message.senderAvatar}
                          alt={message.senderName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            mine ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {parseInitials(message.senderName)}
                        </div>
                      )}
                      <span className={`text-[11px] font-semibold ${mine ? "text-white/90" : "text-slate-700"}`}>
                        {mine ? `${currentUserName} (Sen)` : message.senderName}
                      </span>
                      <span className={`text-[10px] ${mine ? "text-white/75" : "text-slate-400"}`}>
                        {message.senderRole}
                      </span>
                    </div>
                    <p className={`text-[13px] leading-relaxed whitespace-pre-wrap break-words ${mine ? "text-white" : "text-slate-700"}`}>
                      {message.content}
                    </p>
                    <div className={`mt-1.5 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                      {formatDate(message.createdAt)} {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-100 bg-white p-3">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={2}
              maxLength={ADMIN_CHAT_MAX_MESSAGE_LENGTH}
              placeholder="Mesajini yaz... (Enter gonderir, Shift+Enter yeni satir)"
              className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={sending || !text.trim()}
              className="min-w-[96px] rounded-lg border-none bg-[#B8956A] px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60 cursor-pointer hover:bg-[#A07D5A]"
            >
              {sending ? "Gonder..." : "Gonder"}
            </button>
          </div>
          <div className="mt-1.5 text-right text-[11px] text-slate-400">
            {text.length}/{ADMIN_CHAT_MAX_MESSAGE_LENGTH}
          </div>
        </div>
      </div>
    </div>
  );
}
