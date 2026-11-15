/* حفظ حالة المنصة في Supabase (اختياري).
   - بدون متغيرات البيئة: يعمل الموقع كما هو والحالة في الذاكرة فقط.
   - مع المتغيرات: تُحفظ كل تغييرات المستخدم في جدول portal_state، وتُسترجع عند فتح الموقع.
   كل متصفح له صف خاص به (معرّف عشوائي محفوظ في المتصفح)، ويمكن جعل الجميع يتشاركون صفًا واحدًا
   بضبط NEXT_PUBLIC_SHARED_DEMO=true. */

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SHARED = process.env.NEXT_PUBLIC_SHARED_DEMO === "true";

export const persistenceEnabled = Boolean(URL_ && KEY) && typeof window !== "undefined";

function rowId(): string {
  if (SHARED) return "shared";
  try {
    let id = localStorage.getItem("alasala-demo-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("alasala-demo-id", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

const headers = () => ({ apikey: KEY as string, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });

/** يقرأ الحالة المحفوظة، أو null إن لم توجد أو تعذّر الاتصال */
export async function loadRemote<T>(): Promise<T | null> {
  if (!persistenceEnabled) return null;
  try {
    const r = await fetch(`${URL_}/rest/v1/portal_state?id=eq.${encodeURIComponent(rowId())}&select=data`, { headers: headers() });
    if (!r.ok) return null;
    const rows = (await r.json()) as { data: T }[];
    return rows[0]?.data ?? null;
  } catch {
    return null;
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;
let pending: unknown;

/** يحفظ الحالة بعد توقف التغييرات نصف ثانية، وأي فشل يُتجاهل بصمت */
export function saveRemote(data: unknown) {
  if (!persistenceEnabled) return;
  pending = data;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      await fetch(`${URL_}/rest/v1/portal_state?on_conflict=id`, {
        method: "POST",
        headers: { ...headers(), Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ id: rowId(), data: pending, updated_at: new Date().toISOString() }),
      });
    } catch {
      /* الاتصال غير متاح: تبقى الحالة في الذاكرة */
    }
  }, 500);
}

/** يمسح الحالة المحفوظة لهذا المتصفح (إعادة ضبط العرض) */
export async function resetRemote() {
  if (!persistenceEnabled) return;
  try {
    await fetch(`${URL_}/rest/v1/portal_state?id=eq.${encodeURIComponent(rowId())}`, { method: "DELETE", headers: headers() });
  } catch {}
}
