"use client";

import { useEffect, useRef, useState } from "react";

type Message = { id: string; senderId: string; body: string; createdAt: string };

export function ChatThread({
  matchId,
  myUserId,
  initialMessages,
}: {
  matchId: string;
  myUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Prosty polling zamiast WebSocket/Socket.IO - hosting współdzielony (Aderlo Cloud,
  // Passenger) nie gwarantuje długożyjących połączeń; patrz docs/assumptions.md.
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/matches/${matchId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [matchId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setDraft("");

    const res = await fetch(`/api/matches/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    }

    setSending(false);
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--muted)]">
            To początek waszej rozmowy - napisz coś miłego!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === myUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "text-white"
                    : "border border-[var(--border)] text-[var(--foreground)]"
                }`}
                style={mine ? { background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" } : undefined}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-[var(--border)] p-3">
        <input
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--spark-1)]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          placeholder="Napisz wiadomość..."
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--spark-1), var(--spark-2))" }}
        >
          Wyślij
        </button>
      </form>
    </div>
  );
}
