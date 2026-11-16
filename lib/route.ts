"use client";
import { useEffect, useSyncExternalStore } from "react";

export type Page = "home" | "story" | "session" | "student" | "alumni" | "employers" | "university" | "center";

const MAP: Record<string, Page> = {
  student: "student",
  experience: "student",
  alumni: "alumni",
  employers: "employers",
  university: "university",
  center: "center",
  mis: "university",
  results: "university",
};

export function parseHash(h: string): Page {
  const k = h.replace(/^#\/?/, "");
  if (/^story[\/-]/.test(k)) return "story";
  if (/^session[\/-]/.test(k)) return "session";
  return MAP[k] ?? "home";
}
export const storyId = () => (typeof window === "undefined" ? "1" : window.location.hash.replace(/^#\/?story[\/-]/, "") || "1");

const sub = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export function usePage(): Page {
  const h = useSyncExternalStore(sub, () => window.location.hash, () => "");
  return parseHash(h);
}

export function goPage(p: Page) {
  window.location.hash = p === "home" ? "#" : `#${p}`;
}

/* نية الانتقال إلى تبويب داخل بوابة: تضعها القائمة العلوية وتلتقطها البوابة عند ظهورها */
const intent: { key: string | null } = { key: null };
export function goTab(page: Page, key: string) {
  intent.key = key;
  if (parseHash(window.location.hash) === page) window.dispatchEvent(new Event("tabintent"));
  else window.location.hash = `#${page}`;
}
export function useTabIntent(apply: (key: string) => void) {
  useEffect(() => {
    const h = () => {
      if (intent.key !== null) {
        const k = intent.key;
        intent.key = null;
        apply(k);
      }
    };
    h();
    window.addEventListener("tabintent", h);
    return () => window.removeEventListener("tabintent", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* رابط غرفة الجلسة: #/session/<رقم الحجز>/<student|mentor> */
export const sessionParams = () => {
  const [id = "b3", role = "student"] = (typeof window === "undefined" ? "" : window.location.hash.replace(/^#\/?session[\/-]/, "")).split(/[\/-]/);
  return { id, role: role === "mentor" ? "mentor" : "student" } as { id: string; role: "student" | "mentor" };
};
export const joinSession = (id: string, role: "student" | "mentor") => {
  window.location.hash = `#session-${id}-${role}`;
};

