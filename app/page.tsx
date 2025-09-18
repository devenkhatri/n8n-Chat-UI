"use client";

import { useEffect, useRef, useState } from "react";
import { generateMessageId } from "../lib/utils/id";
import Header from "../components/ui/header";
import Layout from "../components/ui/layout";
import ChatInput from "../components/ui/chat-input";
import MessageList from "../components/ui/message-list";
import TypingIndicator from "../components/ui/typing-indicator";
import LoadingState from "../components/ui/loading-state";
import MobileViewport from "../components/ui/mobile-viewport";
import { AccessibleToastContainer } from "../components/ui/toast-container";
import { ConnectionStatusToast } from "../components/ui/connection-status";
import SettingsModal, { useSettingsModal } from "../components/ui/settings-modal";

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
  const [initialLoading, setInitialLoading] = useState(true);
  const { isOpen: isSettingsOpen, openSettings, closeSettings } = useSettingsModal();

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/chat", { method: "GET" })
      .then((r) => r.json())
      .then((d) => {
        const remaining = typeof d?.remaining === "number" ? d.remaining : MAX_MESSAGES;
        setRemaining(remaining);
      })
      .catch(() => {
        setRemaining(MAX_MESSAGES);
      })
      .finally(() => {
        // Add a small delay to show the loading state
        setTimeout(() => setInitialLoading(false), 500);
      });
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const canSend = remaining > 0 && !loading && input.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const userMsg: ChatMessage = { id: generateMessageId("user"), role: "user", content: input.trim() };
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
          { id: generateMessageId("assistant"), role: "assistant", content: `Error: ${errText}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: generateMessageId("assistant"), role: "assistant", content: String(data?.reply ?? "") },
        ]);
      }
      const remaining = typeof data?.remaining === "number" ? data.remaining : 0;
      setRemaining(remaining);
    } catch (err) {
      const errorObj = err as unknown as { message?: string };
      setMessages((prev) => [
        ...prev,
        { id: generateMessageId("assistant"), role: "assistant", content: `Error: ${errorObj?.message || "Network error"}` },
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
        setMessages([]);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };



  // Convert messages to the format expected by ChatMessage component
  const chatMessages = messages.map(m => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    timestamp: new Date(), // You might want to add actual timestamps to your message type
    status: loading && messages[messages.length - 1]?.id === m.id ? 'sending' as const : 'sent' as const
  }));

  return (
    <MobileViewport>
      <Layout.MainLayout>
        <Header 
          title="Fun - Chat"
          subtitle="Conversational chat app with n8n webhook backend"
          remainingMessages={remaining}
          onReset={handleReset}
          onSettingsClick={openSettings}
          showBranding={true}
        />
        
        <Layout.ContentArea className="flex flex-col safe-area-bottom bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/10">
          <Layout.Container className="flex-1 flex flex-col h-full max-w-4xl">
          {/* Chat Messages Area */}
          <div 
            ref={listRef} 
            className="flex-1 overflow-y-auto min-h-0 pb-6 -webkit-overflow-scrolling-touch"
          >
            <Layout.Stack spacing="md" className="min-h-full py-6">
              {initialLoading ? (
                <Layout.Flex 
                  justify="center" 
                  align="center" 
                  className="flex-1 min-h-[300px]"
                >
                  <LoadingState
                    variant="message-skeleton"
                    messageCount={3}
                    message="Loading chat..."
                  />
                </Layout.Flex>
              ) : messages.length === 0 ? (
                <Layout.Flex 
                  justify="center" 
                  align="center" 
                  className="flex-1 min-h-[400px]"
                >
                  <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <span className="text-3xl">💬</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                      Start a conversation
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Ask me anything! I&apos;m here to help with your questions and have a friendly chat.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        Ask questions
                      </span>
                      <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        Get help
                      </span>
                      <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        Have fun
                      </span>
                    </div>
                  </div>
                </Layout.Flex>
              ) : (
                <>
                  <MessageList
                    messages={chatMessages}
                    showActions={true}
                    onCopy={(messageId) => {
                      const message = chatMessages.find(m => m.id === messageId);
                      if (message) {
                        navigator.clipboard.writeText(message.content);
                      }
                    }}
                    onRegenerate={(messageId) => {
                      // TODO: Implement regenerate functionality
                      console.log('Regenerate message:', messageId);
                    }}
                    onFeedback={(messageId, type) => {
                      // TODO: Implement feedback functionality
                      console.log('Feedback for message:', messageId, type);
                    }}
                  />
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                        <TypingIndicator 
                          visible={true}
                          variant="dots"
                          message="Thinking..."
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </Layout.Stack>
          </div>

          {/* Chat Input Area */}
          <div className="flex-shrink-0 pt-6 border-t border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={() => {
                const syntheticEvent = {
                  preventDefault: () => {},
                } as React.FormEvent;
                onSubmit(syntheticEvent);
              }}
              disabled={remaining <= 0}
              loading={loading}
              placeholder={remaining > 0 ? "Type your message..." : "Message limit reached"}
              maxLength={2000}
              remainingMessages={remaining}
            />
            
            <Layout.Flex 
              justify="between" 
              align="center" 
              className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium"
            >
              <span>You can send up to {MAX_MESSAGES} messages.</span>
              <span className="hidden sm:inline opacity-75">
                Built with Next.js • Proxied to n8n webhook
              </span>
            </Layout.Flex>
          </div>
          </Layout.Container>
        </Layout.ContentArea>
      </Layout.MainLayout>
      
      {/* Toast notifications */}
      <AccessibleToastContainer position="top-right" />
      <ConnectionStatusToast />
      
      {/* Settings Modal - Rendered at root level for proper z-index layering */}
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </MobileViewport>
  );
}
