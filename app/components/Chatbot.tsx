"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChatbotLink, ChatbotSpec } from "@/lib/data";
import { openGateway } from "@/lib/open-gateway";

type Msg = { id: number; from: "bot" | "user"; text: string; links?: ChatbotLink[] };

// توحيد الحروف لمطابقة الكلمات المفتاحية: بلا تشكيل، وهمزات الألف والياء والتاء المربوطة
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();

const FOCUSABLE = 'button, a[href], input, [tabindex]:not([tabindex="-1"])';

function ChatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </svg>
  );
}

function CloseIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function Chatbot({ spec }: { spec: ChatbotSpec }) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [text, setText] = useState("");
  // الأسئلة المقترحة ظاهرة في البداية، وتُطوى بعد أول سؤال ويمكن إظهارها بالضغط
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, from: "bot", text: spec.greeting },
  ]);
  const nextId = useRef(1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const titleId = useId();

  // الموبايل: النافذة بعرض الشاشة وتحبس التركيز
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Esc يغلق ويعيد التركيز للأيقونة
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // عند الفتح: التركيز على النافذة، ومنع تمرير الصفحة خلفها في الموبايل
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    if (!mobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mobile]);

  // النزول لآخر رسالة
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const push = (from: Msg["from"], body: string, links?: ChatbotLink[]) =>
    setMessages((m) => [...m, { id: nextId.current++, from, text: body, links }]);

  const ask = (question: string, answerId?: string) => {
    setShowSuggestions(false);
    push("user", question);
    const answer = answerId
      ? spec.answers.find((a) => a.id === answerId)
      : findAnswer(question);
    if (answer) push("bot", answer.text, answer.links);
    else push("bot", spec.fallback);
  };

  // مطابقة كلمات مفتاحية بسيطة: الرد الأكثر تطابقًا، وعند التعادل الأول في الترتيب
  const findAnswer = (input: string) => {
    const n = normalize(input);
    let best: (typeof spec.answers)[number] | undefined;
    let bestScore = 0;
    for (const a of spec.answers) {
      const score = a.keywords.filter((k) => n.includes(normalize(k))).length;
      if (score > bestScore) {
        best = a;
        bestScore = score;
      }
    }
    return best;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    setText("");
    if (q) ask(q);
  };

  const onLink = (e: React.MouseEvent, l: ChatbotLink) => {
    if (l.gateway) {
      e.preventDefault();
      close();
      openGateway(l.gateway);
    } else {
      close();
    }
  };

  // الموبايل: حبس التركيز داخل النافذة
  const onDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !mobile || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const suggested = spec.answers.filter((a) => a.suggested);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? spec.ui.close : spec.ui.open}
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
        className="fixed bottom-4 start-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue text-white shadow-lg transition-colors hover:bg-blue-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {open && (
        <div
          ref={dialogRef}
          id={dialogId}
          role="dialog"
          aria-modal={mobile}
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={onDialogKeyDown}
          className="fixed inset-0 z-50 flex flex-col bg-bg focus:outline-none md:inset-auto md:bottom-24 md:start-4 md:h-[34rem] md:max-h-[calc(100vh-7rem)] md:w-96 md:overflow-hidden md:rounded-[12px] md:border md:border-line/40 md:shadow-xl"
        >
          <div className="flex items-start justify-between gap-3 bg-blue px-4 py-3 text-white">
            <div>
              <h2 id={titleId} className="text-base font-bold">
                {spec.name}
              </h2>
              <p className="mt-0.5 text-xs text-bg-soft">{spec.badge}</p>
            </div>
            <button
              type="button"
              aria-label={spec.ui.close}
              onClick={close}
              className="rounded-full p-1 text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label={spec.ui.log}
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
          >
            {messages.map((m) => (
              <div key={m.id} className={`flex max-w-[88%] flex-col gap-2 ${m.from === "user" ? "self-end" : "self-start"}`}>
                <p
                  className={`whitespace-pre-line rounded-[12px] px-3 py-2 text-sm leading-7 ${
                    m.from === "user" ? "bg-blue text-white" : "bg-bg-soft text-ink"
                  }`}
                >
                  {m.text}
                </p>
                {m.links && m.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.links.map((l) => (
                      <a
                        key={l.label}
                        href={l.href ?? "#gateways"}
                        onClick={(e) => onLink(e, l)}
                        className="rounded-full border border-blue px-3 py-1 text-xs font-bold text-orange-text transition-colors hover:bg-bg-soft"
                      >
                        {spec.ui.goTo} {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-line/40 px-3 py-2">
            <button
              type="button"
              aria-expanded={showSuggestions}
              aria-controls={`${dialogId}-suggestions`}
              onClick={() => setShowSuggestions((s) => !s)}
              className="flex w-full items-center justify-between text-xs font-bold text-ink-2"
            >
              {spec.ui.suggestions}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className={`h-4 w-4 transition-transform ${showSuggestions ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 8l5 5 5-5" />
              </svg>
            </button>
            {showSuggestions && (
              <div
                id={`${dialogId}-suggestions`}
                className="mt-2 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto"
              >
                {suggested.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => ask(a.question, a.id)}
                    className="rounded-full border border-line px-2.5 py-1 text-start text-xs font-semibold text-navy transition-colors hover:border-blue hover:bg-bg-soft"
                  >
                    {a.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-line/40 p-3">
            <label htmlFor={`${dialogId}-input`} className="sr-only">
              {spec.ui.inputLabel}
            </label>
            <input
              id={`${dialogId}-input`}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={spec.ui.placeholder}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-[12px] border border-line bg-bg px-3 py-2 text-base text-ink focus:border-blue focus:outline-2 focus:outline-blue md:text-sm"
            />
            <button
              type="submit"
              className="rounded-[12px] bg-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-bright"
            >
              {spec.ui.send}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
