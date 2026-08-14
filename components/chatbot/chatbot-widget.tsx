"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Headset, MessageCircle, Send, X } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { chatbotKnowledge } from "@/lib/chatbot";
import { useStore } from "@/hooks/use-store";

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
  source?: "knowledge" | "ai" | "fallback";
};

function cn(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ChatbotWidget() {
  const knowledge = chatbotKnowledge;
  const { dictionary: t, locale } = useI18n();
  const { cartDrawerOpen } = useStore();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAutoScrollRef = useRef(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      text: t.chatbot.greeting,
      source: "knowledge",
    },
  ]);

  const nextId = useRef(2);

  const quickPrompts = useMemo(
    () => t.chatbot.quickPrompts,
    [t.chatbot.quickPrompts],
  );

  function cancelScheduledClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleDesktopClose() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      if (!panelRef.current?.contains(document.activeElement)) setOpen(false);
      closeTimerRef.current = null;
    }, 1000);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelScheduledClose();
    };
  }, [open]);

  useEffect(() => {
    if (cartDrawerOpen) setOpen(false);
  }, [cartDrawerOpen]);

  function handleMessagesScroll() {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 80;
  }

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!open || !container || !shouldAutoScrollRef.current) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: "bot",
        text: t.chatbot.greeting,
        source: "knowledge",
      },
    ]);
    nextId.current = 2;
    setInput("");
    setLoading(false);
  }, [locale, t.chatbot.greeting]);

  if (!knowledge.enabled) {
    return null;
  }

  async function addConversation(question: string) {
    const trimmed = question.trim();

    if (!trimmed || loading) {
      return;
    }

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      text: trimmed,
    };

    shouldAutoScrollRef.current = true;
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmed,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API respondeu com ${response.status}`);
      }

      const data: {
        answer?: string;
        source?: string;
      } = await response.json();

      const answer =
        typeof data.answer === "string" && data.answer.trim()
          ? data.answer.trim()
          : t.chatbot.fallback;

      const source: Message["source"] =
        data.source === "ai"
          ? "ai"
          : data.source === "knowledge"
            ? "knowledge"
            : "fallback";

      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "bot",
          text: answer,
          source,
        },
      ]);
    } catch (error) {
      console.error("Erro no chatbot:", error);

      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "bot",
          text: t.chatbot.fallback,
          source: "fallback",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void addConversation(input);
  }

  return (
    <div className={cn(
      "pointer-events-none fixed z-50",
      cartDrawerOpen
        ? "bottom-auto left-[max(1rem,env(safe-area-inset-left))] right-auto top-[max(1rem,env(safe-area-inset-top))] sm:bottom-6 sm:left-auto sm:right-[calc(28rem+1.5rem)] sm:top-auto"
        : "bottom-[max(5rem,calc(env(safe-area-inset-bottom)+1.25rem))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-6 sm:right-6",
    )}>
      <div
        ref={panelRef}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleDesktopClose}
        onFocusCapture={cancelScheduledClose}
        className={cn(
          "mb-4 flex max-h-[calc(100dvh-7rem)] w-[calc(100vw-2rem)] max-w-[390px] origin-bottom-right flex-col overflow-hidden border border-champagne/35 bg-[#080706] text-white shadow-2xl transition duration-300 sm:max-h-[640px] sm:w-[390px]",
          cartDrawerOpen && "hidden",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="border-b border-white/10 bg-gradient-to-br from-[#12100d] to-[#050505] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-champagne">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-champagne/35 bg-champagne/10">
                  <Headset size={13} />
                </span>
                {t.chatbot.title}
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                {knowledge.brandName}
              </h2>

              <p className="mt-1 text-sm text-stone-300">
                {t.chatbot.greeting}
              </p>
            </div>

            <button
              type="button"
              onClick={() => { cancelScheduledClose(); setOpen(false); }}
              className="grid h-9 w-9 place-items-center border border-white/10 text-stone-300 transition hover:border-champagne hover:text-champagne"
              aria-label={t.chatbot.close}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#0b0a08] p-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user"
                  ? "justify-end"
                  : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[86%] px-4 py-3 text-sm leading-6",
                  message.role === "user"
                    ? "bg-champagne text-black"
                    : "border border-white/10 bg-white/[0.04] text-stone-200",
                )}
              >
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-stone-300">
                <span>{t.chatbot.loading}</span>
                <span className="flex gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-champagne" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-champagne [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-champagne [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-[#080706] p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={loading}
                onClick={() => void addConversation(prompt)}
                className="border border-champagne/25 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-champagne transition hover:bg-champagne hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void addConversation(input);
                }
              }}
              disabled={loading}
              placeholder={t.chatbot.placeholder}
              className="min-h-12 flex-1 border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-champagne disabled:opacity-60"
              aria-label={t.chatbot.inputLabel}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-12 w-12 place-items-center bg-champagne text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t.chatbot.send}
            >
              <Send size={17} />
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-stone-500">
            <a
              className="transition hover:text-champagne"
              href={knowledge.contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>

            <a
              className="transition hover:text-champagne"
              href={`mailto:${knowledge.contact.email}`}
            >
              Email
            </a>

            <span>{t.chatbot.aiLabel}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center gap-2 rounded-full border border-champagne/55 bg-[#090807] text-champagne shadow-2xl transition hover:-translate-y-0.5 hover:bg-champagne hover:text-black",
          cartDrawerOpen ? "sm:w-14 sm:px-0" : "sm:w-auto sm:px-4",
        )}
        aria-label={
          open ? t.chatbot.minimize : t.chatbot.open
        }
        aria-expanded={open}
      >
        {open ? (
          <X size={22} />
        ) : (
          <>
            <MessageCircle size={22} />
            <span className={cn("hidden text-xs font-bold uppercase tracking-[0.18em]", !cartDrawerOpen && "sm:inline")}>
              {t.chatbot.button}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
