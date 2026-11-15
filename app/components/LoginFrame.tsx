/* إطار شاشة الدخول: صورة على جانب والنموذج على الجانب الآخر (الصورة تختفي على الجوال) */
import type { ReactNode } from "react";

export default function LoginFrame({ img, pos = "center 30%", caption, children }: { img: string; pos?: string; caption: string; children: ReactNode }) {
  return (
    <div className="grid overflow-hidden rounded-[16px] border border-line/40 shadow-md md:grid-cols-[1fr_1.1fr]" style={{ background: "#f4f2ef" }}>
      <div className="relative hidden min-h-[440px] md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`./images/${img}.jpg`} alt={caption} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: pos }} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1e1e1e]/90 to-transparent p-5 pt-16 text-white">
          <p className="text-sm font-bold">{caption}</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-4">{children}</div>
    </div>
  );
}
