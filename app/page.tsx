"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = parseInt(process.env.NEXT_PUBLIC_MAX_MESSAGES || "5", 10) || 5;

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState<number>(MAX_MESSAGES);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/chat", { method: "GET" })
      .then((r) => r.json())
      .then((d) => {
        const remaining = typeof d?.remaining === "number" ? d.remaining : MAX_MESSAGES;
        setRemaining(remaining);
        setShowReset(remaining <= 0);
      })
      .catch(() => {
        setRemaining(MAX_MESSAGES);
        setShowReset(false);
      });
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const canSend = remaining > 0 && !loading && input.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: messages }),
      });
      const data = await res.json().catch(() => ({ reply: "", remaining: 0 }));
      if (!res.ok) {
        const errText = data?.error || `Request failed (${res.status})`;
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errText}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: String(data?.reply ?? "") },
        ]);
      }
      const remaining = typeof data?.remaining === "number" ? data.remaining : 0;
      setRemaining(remaining);
      setShowReset(remaining <= 0);
    } catch (err) {
      const errorObj = err as unknown as { message?: string };
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorObj?.message || "Network error"}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      if (res.ok) {
        setRemaining(MAX_MESSAGES);
        setShowReset(false);
        setMessages([]);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  const remainingText = useMemo(() => {
    if (remaining <= 0) return "No messages remaining";
    if (remaining === 1) return "1 message remaining";
    return `${remaining} messages remaining`;
  }, [remaining]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Fun - Chat</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm opacity-80">{remainingText}</div>
            <button
              onClick={handleReset}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                showReset 
                  ? "bg-white-100 dark:bg-white-900/20 text-white dark:text-black hover:bg-white-200 dark:hover:bg-white-900/30" 
                  : "opacity-0 pointer-events-none"
              }`}
              disabled={!showReset}
            >
              Reset Limit
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6 flex flex-col">
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="text-sm opacity-60">Start the conversation below.</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="flex">
                <div className={m.role === "user" ? "chat-bubble-user ml-auto" : "chat-bubble-bot mr-auto w-full"}>
                  {m.role === "assistant" ? (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, rehypePrism]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div>{m.content}</div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex">
              <div className="chat-bubble-bot mr-auto">
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span></span>
                  Thinking...
                </span>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={onSubmit} className="mt-4 flex gap-2">
          <input
            className="flex-1 border rounded-xl px-3 py-2 bg-white/90 dark:bg-black/20 border-black/10 dark:border-white/10 focus:outline-none"
            placeholder={remaining > 0 ? "Type your message..." : "Message limit reached"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={remaining <= 0 || loading}
            maxLength={2000}
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
        <p className="mt-2 text-xs opacity-70">You can send up to {MAX_MESSAGES} messages.</p>
      </main>
      <footer className="container py-6 text-xs opacity-60">
        Built with Next.js • Proxied to n8n webhook
      </footer>
    </div>
  );
}
