"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_STUDENTS, MENTORS, MODE_LABEL, mentorOf, portalActions as store, usePortal } from "@/lib/portal-store";
import { sessionParams, usePage } from "@/lib/route";

type Msg = { from: "me" | "other"; text: string };
const initials = (n: string) => n.replace(/^أ\.\s*/, "").split(" ").slice(0, 2).map((w) => w[0]).join(" ");

function Tile({ name, sub, speaking, off, big, video }: { name: string; sub: string; speaking?: boolean; off?: boolean; big?: boolean; video?: React.RefObject<HTMLVideoElement | null> | null }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-[16px] bg-gradient-to-br from-[#b10035] to-[#1e1e1e] ${big ? "aspect-video w-full" : "aspect-video w-full"} ${speaking ? "ring-4 ring-[#8fd07a]" : "ring-1 ring-white/10"}`}>
      {video && <video ref={video} muted playsInline className={`absolute inset-0 h-full w-full object-cover ${off ? "hidden" : ""}`} />}
      {(off || !video) && (
        <span className={`flex items-center justify-center rounded-full bg-white/15 font-extrabold text-white ${big ? "h-24 w-24 text-3xl" : "h-14 w-14 text-lg"} ${speaking ? "animate-pulse" : ""}`}>{initials(name)}</span>
      )}
      <span className="absolute bottom-2 start-2 rounded-lg bg-black/50 px-2 py-1 text-[11px] font-bold text-white">{name} · {sub}</span>
      {off && <span className="absolute end-2 top-2 rounded-lg bg-black/50 px-2 py-1 text-[11px] text-white">الكاميرا مغلقة</span>}
    </div>
  );
}

const IconBtn = ({ on, label, onClick, danger, children }: { on?: boolean; label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    aria-label={label}
    title={label}
    className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition ${danger ? "bg-[#c0392b] hover:bg-[#a93226] w-auto px-5 text-sm font-bold" : on === false ? "bg-[#c0392b]/90" : "bg-white/15 hover:bg-white/25"}`}
  >
    {children}
  </button>
);
const ic = (d: string) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const REPLIES = ["أهلًا، يسعدني أن نبدأ.", "ممتاز، سأدوّن ذلك في الملاحظات.", "فكرة جيدة، فلنضعها هدفًا لهذا الشهر.", "هل تريد أن نراجع السيرة بعد ذلك؟"];

export default function SessionRoom() {
  usePage();
  const st = usePortal();
  const [{ id, role }, setP] = useState(sessionParams());
  useEffect(() => {
    const f = () => setP(sessionParams());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);

  const b = st.bookings.find((x) => x.id === id) ?? st.bookings.find((x) => x.mode === "video") ?? st.bookings[0];
  const stu = ALL_STUDENTS.find((x) => x.id === b?.studentId) ?? ALL_STUDENTS[0];
  const mentor = b ? mentorOf(b.studentId) : MENTORS[0];
  const me = role === "mentor" ? { name: mentor.name, sub: mentor.role } : { name: stu.name, sub: "طالب" };
  const other = role === "mentor" ? { name: stu.name, sub: "طالب" } : { name: mentor.name, sub: mentor.role };

  const [phase, setPhase] = useState<"lobby" | "call" | "end">("lobby");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(false);
  const [share, setShare] = useState(false);
  const [camErr, setCamErr] = useState("");
  const [secs, setSecs] = useState(0);
  const [tab, setTab] = useState<"notes" | "chat" | "plan">("notes");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState(b?.note ?? "");
  const [talk, setTalk] = useState(false);
  const [rate, setRate] = useState(0);
  const [fb, setFb] = useState("");
  const [saved, setSaved] = useState(false);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const vid = useRef<HTMLVideoElement | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const rIdx = useRef(0);

  const stopCam = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  const toggleCam = async () => {
    if (cam) {
      stopCam();
      setCam(false);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.current = s;
      setCam(true);
      setCamErr("");
      requestAnimationFrame(() => {
        if (vid.current) vid.current.srcObject = s;
      });
    } catch {
      setCamErr("تعذّر تشغيل الكاميرا في هذه المعاينة. في النسخة الفعلية تعمل بإذنك.");
    }
  };
  useEffect(() => {
    if (cam && vid.current && stream.current) vid.current.srcObject = stream.current;
  }, [cam, phase]);
  useEffect(() => () => stopCam(), []);

  useEffect(() => {
    if (phase !== "call") return;
    const t = setInterval(() => setSecs((x) => x + 1), 1000);
    const s = setInterval(() => setTalk((x) => !x), 2400);
    return () => {
      clearInterval(t);
      clearInterval(s);
    };
  }, [phase]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setDraft("");
    setTimeout(() => setMsgs((m) => [...m, { from: "other", text: REPLIES[rIdx.current++ % REPLIES.length] }]), 1400);
  };

  const finish = () => {
    stopCam();
    setPhase("end");
  };
  const save = () => {
    if (role === "mentor" && b) store.setBooking(b.id, { status: "done", note: notes.trim() || b.note });
    setSaved(true);
  };

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const plan = ["تعارف وهدف الجلسة (5 دقائق)", `مناقشة: ${b?.topic ?? "الموضوع"}`, "تحديد خطوتين للأسبوع القادم", "اتفاق على موعد المتابعة"];
  const back = role === "mentor" ? "#center" : "#student";

  return (
    <section aria-label="غرفة الجلسة" className="min-h-[75vh] bg-[#0b2a3a] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#cdb774]">غرفة جلسة تجريبية</p>
            <h1 className="text-xl font-extrabold md:text-2xl">{b?.topic ?? "جلسة إرشاد"}</h1>
            <p className="text-xs text-white/70">{b?.slot} · {MODE_LABEL[b?.mode ?? "video"]} · {mentor.name} مع {stu.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {phase === "call" && <span dir="ltr" className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold tabular-nums"><span className="me-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[#ff5a4d]" />{mm}:{ss}</span>}
            <a href={back} onClick={stopCam} className="text-sm font-bold text-white/80 hover:text-white">&rarr; العودة للبوابة</a>
          </div>
        </div>

        {phase === "lobby" && (
          <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <Tile name={me.name} sub={me.sub} off={!cam} big video={vid} />
              <div className="mt-3 flex items-center justify-center gap-3">
                <IconBtn on={mic} label={mic ? "إيقاف الميكروفون" : "تشغيل الميكروفون"} onClick={() => setMic(!mic)}>{ic(mic ? "M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3" : "M4 4l16 16M12 3a3 3 0 00-3 3v6M15 9v3a3 3 0 01-4.5 2.600M5 11a7 7 0 0011 5.700M12 18v3")}</IconBtn>
                <IconBtn on={cam} label={cam ? "إيقاف الكاميرا" : "تشغيل الكاميرا"} onClick={toggleCam}>{ic(cam ? "M3 7h11v10H3zM14 11l7-4v10l-7-4" : "M4 4l16 16M3 7h11v10H3zM14 11l7-4v10")}</IconBtn>
              </div>
              {camErr && <p role="status" className="mt-2 text-center text-xs text-[#cdb774]">{camErr}</p>}
            </div>
            <div className="rounded-[16px] bg-white/10 p-5">
              <h2 className="text-base font-extrabold">جاهز للانضمام؟</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/85">
                <li>الطرف الآخر: {other.name}</li>
                <li>الموعد: {b?.slot}</li>
                <li>الميكروفون: {mic ? "يعمل" : "مغلق"} · الكاميرا: {cam ? "تعمل" : "مغلقة"}</li>
              </ul>
              <button type="button" onClick={() => setPhase("call")} className="mt-5 w-full rounded-full bg-[#8fd07a] px-6 py-3 text-sm font-extrabold text-[#1e1e1e] hover:opacity-90">انضم الآن</button>
              <p className="mt-3 text-[11px] leading-5 text-white/60">معاينة للجلسة، والطرف الآخر وهمي. تُربط لاحقًا بـ Teams أو Zoom أو Meet.</p>
            </div>
          </div>
        )}

        {phase === "call" && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div>
              {share ? (
                <div className="relative flex aspect-video w-full items-center justify-center rounded-[16px] bg-white text-navy">
                  <div className="text-center">
                    <p className="text-sm font-bold text-orange-text">{me.name} يشارك شاشته</p>
                    <p className="mt-2 text-lg font-extrabold">السيرة الذاتية، النسخة 2</p>
                    <p className="mt-1 text-xs text-ink-2">عرض تجريبي لمشاركة الشاشة</p>
                  </div>
                  <div className="absolute bottom-3 start-3 w-40"><Tile name={other.name} sub={other.sub} speaking={talk} /></div>
                </div>
              ) : (
                <div className="relative">
                  <Tile name={other.name} sub={other.sub} speaking={talk} big />
                  <div className="absolute bottom-3 end-3 w-36 sm:w-44"><Tile name={me.name} sub="أنت" off={!cam} video={vid} /></div>
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <IconBtn on={mic} label={mic ? "إيقاف الميكروفون" : "تشغيل الميكروفون"} onClick={() => setMic(!mic)}>{ic(mic ? "M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3" : "M4 4l16 16M12 3a3 3 0 00-3 3v6M15 9v3a3 3 0 01-4.5 2.600M5 11a7 7 0 0011 5.700M12 18v3")}</IconBtn>
                <IconBtn on={cam} label={cam ? "إيقاف الكاميرا" : "تشغيل الكاميرا"} onClick={toggleCam}>{ic(cam ? "M3 7h11v10H3zM14 11l7-4v10l-7-4" : "M4 4l16 16M3 7h11v10H3zM14 11l7-4v10")}</IconBtn>
                <IconBtn on={share ? true : undefined} label="مشاركة الشاشة" onClick={() => setShare(!share)}>{ic("M3 5h18v11H3zM8 20h8M12 16v4")}</IconBtn>
                <IconBtn danger label="إنهاء الجلسة" onClick={finish}>إنهاء الجلسة</IconBtn>
              </div>
              {camErr && <p role="status" className="mt-2 text-center text-xs text-[#cdb774]">{camErr}</p>}
              {!mic && <p className="mt-2 text-center text-xs text-white/70">الميكروفون مغلق</p>}
            </div>

            <div className="rounded-[16px] bg-white text-ink">
              <div role="tablist" className="grid grid-cols-3 border-b border-line/30 text-xs font-bold">
                {([["notes", "الملاحظات"], ["chat", "المحادثة"], ["plan", "محاور الجلسة"]] as const).map(([k, l]) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-2 py-3 ${tab === k ? "border-b-2 border-blue text-orange-text" : "text-ink-2"}`}>{l}</button>
                ))}
              </div>
              <div className="p-4">
                {tab === "notes" && (
                  <>
                    <label className="text-xs font-bold text-ink-2" htmlFor="sn">{role === "mentor" ? "ملاحظات المرشد (تُحفظ في ملف الطالب)" : "ملاحظاتي الشخصية"}</label>
                    <textarea id="sn" value={notes} onChange={(e) => setNotes(e.target.value)} rows={9} className="mt-2 w-full rounded-[10px] border border-[#d9d2ca] p-3 text-sm focus:border-blue focus:outline-none" placeholder="اكتب النقاط المهمة هنا" />
                  </>
                )}
                {tab === "chat" && (
                  <>
                    <ul aria-live="polite" className="h-52 space-y-2 overflow-y-auto">
                      {msgs.length === 0 && <li className="text-xs text-ink-2">لا رسائل بعد. اكتب رسالة وسيرد الطرف الآخر.</li>}
                      {msgs.map((m, i) => (
                        <li key={i} className={`max-w-[85%] rounded-[12px] px-3 py-2 text-sm ${m.from === "me" ? "me-auto bg-[#f3ecdc] text-navy" : "ms-auto bg-[#f3efe9]"}`}>{m.text}</li>
                      ))}
                    </ul>
                    <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="رسالة" className="min-w-0 flex-1 rounded-full border border-[#d9d2ca] px-4 py-2 text-sm focus:border-blue focus:outline-none" placeholder="اكتب رسالة" />
                      <button type="submit" className="rounded-full bg-blue px-4 py-2 text-sm font-bold text-white">إرسال</button>
                    </form>
                  </>
                )}
                {tab === "plan" && (
                  <ul className="space-y-2">
                    {plan.map((p, i) => (
                      <li key={p}>
                        <label className="flex items-start gap-2 text-sm">
                          <input type="checkbox" checked={!!done[i]} onChange={() => setDone({ ...done, [i]: !done[i] })} className="mt-1" />
                          <span className={done[i] ? "text-ink-2 line-through" : ""}>{p}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === "end" && (
          <div className="mx-auto mt-8 max-w-xl rounded-[18px] bg-white p-6 text-ink">
            <h2 className="text-xl font-extrabold text-navy">انتهت الجلسة ({mm}:{ss})</h2>
            {role === "student" ? (
              <>
                <p className="mt-2 text-sm text-ink-2">كيف كانت الجلسة؟</p>
                <div role="radiogroup" aria-label="التقييم" className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={rate === n} onClick={() => setRate(n)} className={`h-11 w-11 rounded-full border text-base font-extrabold ${rate >= n ? "border-[#cdb774] bg-[#cdb774] text-navy" : "border-[#d9d2ca] text-ink-2"}`}>{n}</button>
                  ))}
                </div>
                <textarea value={fb} onChange={(e) => setFb(e.target.value)} rows={3} aria-label="ملاحظتك" className="mt-3 w-full rounded-[10px] border border-[#d9d2ca] p-3 text-sm" placeholder="ما الذي استفدته؟ وما الذي تريده في الجلسة القادمة؟" />
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-ink-2">ملاحظات الجلسة التي ستظهر للطالب بعد الحفظ:</p>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} aria-label="ملاحظات المرشد" className="mt-3 w-full rounded-[10px] border border-[#d9d2ca] p-3 text-sm" />
              </>
            )}
            {!saved ? (
              <button type="button" onClick={save} className="mt-4 rounded-full bg-blue px-6 py-3 text-sm font-bold text-white">{role === "mentor" ? "حفظ وإغلاق الجلسة" : "إرسال التقييم"}</button>
            ) : (
              <p role="status" className="mt-4 text-sm font-bold text-[#3a6e22]">{role === "mentor" ? "حُفظت الملاحظات وأُغلقت الجلسة، وتظهر الآن للطالب." : "شكرًا، وصل تقييمك للمركز."}</p>
            )}
            <a href={back} className="mt-4 block text-sm font-bold text-orange-text">&rarr; العودة للبوابة</a>
          </div>
        )}
      </div>
    </section>
  );
}
