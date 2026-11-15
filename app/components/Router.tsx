"use client";

import { useEffect, type ReactNode } from "react";
import { usePage, type Page } from "@/lib/route";

export default function Router({ pages }: { pages: Record<Page, ReactNode> }) {
  const page = usePage();
  useEffect(() => {
    const h = window.location.hash;
    const id = h.replace(/^#/, "");
    if (page === "home" && id && !id.startsWith("/") && document.getElementById(id)) {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        const head = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
        if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - head));
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [page]);
  return <>{pages[page]}</>;
}
