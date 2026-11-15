# مركز المسار المهني، كلية الحقوق، كليات الأصالة

عرض تجريبي لمركز مسار مهني، موقع ثابت بالعربية (RTL). بياناته كلها تجريبية.

## التقنية
- Next.js (تصدير ثابت `output: "export"`)، React، Tailwind 4، TypeScript.
- التوجيه بالـ hash: `#student` `#alumni` `#employers` `#center` `#university` `#methodology` `#methodology-<id>` `#story-<id>` `#session-<id>-<role>`.
- الخط: Noto Kufi Arabic محلي في `app/fonts` ويُعرَّف في `app/globals.css`.

## الأوامر
- `npm install` ثم `npm run dev` للتشغيل المحلي.
- `npm run build` ينتج `out/` للنشر.

## أين تُعدَّل الأشياء
- الهوية والألوان: `app/globals.css` (الأخضر `#3f7a24` و`#35651f`، الأحمر العنابي `#b10035` للشريط العلوي والتذييل، الذهبي `#cdb774` للخطوط).
- الشعار: `public/logo.png`. الأسماء: `data/universities/demo/university.json` و`platform.json`.
- المنهج الدراسي (8 فصول، 135 ساعة): `data/universities/demo/semesters.json`، وربط المقررات بالمهارات في `course-skill-map.json`، والوظائف الحرجة في `critical-jobs.json`.
- الشركات والوظائف والأحداث والخريجون: `lib/portal-store.ts` وملفات `data/`.
- الأقسام والواجهات: `app/components/`.

## حسابات العرض (كلمة المرور `demo123`)
- طلاب: `std131` (سنة 1)، `std241` (سنة 2)، `std401` (سنة 3)، `std13` (سنة 4). خريج: `alm1`. مرشدان: `sara` و`majed`.
- بوابتا أصحاب العمل والجامعة بزر "دخول" بدون حساب.

## الحفظ
- `lib/persist.ts` يحفظ الحالة في Supabase إن وُجدت `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY`، وإلا تبقى في الذاكرة وتضيع عند إعادة التحميل.
- الجدول في `supabase/schema.sql`. لا تضع مفتاح `service_role` في المشروع أبدًا.

## قواعد
- كل النصوص بالعربية، وتصميم RTL.
- غيّر محتوى `data/` بدل الكود حيثما أمكن.
- بعد أي تعديل شغّل `npm run build` للتأكد من نجاحه.
