import { CERT_ST, CERTS, GRANTS, MODE_LABEL, type State } from "./portal-store";

export type AgendaItem = { id: string; kind: "جلسة" | "فعالية" | "وظيفة" | "شهادة"; title: string; when: string; note?: string };

/** جدول موحد للطالب أو الخريج: جلساته وفعالياته ومواعيد التقديم التي تهمه */
export function agendaFor(st: State, studentId: string): AgendaItem[] {
  const out: AgendaItem[] = [];
  st.bookings
    .filter((b) => b.studentId === studentId && (b.status === "requested" || b.status === "confirmed"))
    .forEach((b) => out.push({ id: `b${b.id}`, kind: "جلسة", title: b.topic, when: b.slot, note: `${MODE_LABEL[b.mode ?? "inperson"]} · ${b.status === "requested" ? "بانتظار التأكيد" : "مؤكدة"}` }));
  st.events.filter((e) => e.registered.includes(studentId)).forEach((e) => out.push({ id: `e${e.id}`, kind: "فعالية", title: e.title, when: e.date, note: e.place }));
  st.applications
    .filter((a) => a.studentId === studentId)
    .forEach((a) => {
      const j = st.jobs.find((x) => x.id === a.jobId);
      if (j) out.push({ id: `j${j.id}`, kind: "وظيفة", title: j.title, when: `آخر موعد ${j.deadline}`, note: "تقدمت" });
    });
  CERTS.filter((c) => st.certPlan[`${studentId}:${c.id}`] === "studying").forEach((c) => out.push({ id: `c${c.id}`, kind: "شهادة", title: c.name, when: CERT_ST.studying, note: c.duration }));
  return out;
}
