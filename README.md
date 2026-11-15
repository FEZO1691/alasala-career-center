# مركز المسار المهني، كلية الحقوق، كليات الأصالة

عرض تجريبي لموقع مركز مسار مهني (طالب، خريج، أصحاب عمل، مرشد، بوابة الجامعة). البيانات تجريبية.

## التشغيل المحلي
```bash
npm install
npm run dev
```

## النشر على GitHub Pages
1. ارفع المشروع إلى مستودع على GitHub (الفرع `main`).
2. Settings ثم Pages ثم Source: **GitHub Actions**.
3. (اختياري) لحفظ التغييرات في Supabase: Settings ثم Secrets and variables ثم Actions ثم تبويب **Variables**، وأضف
   `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY` (وأيضًا `NEXT_PUBLIC_SHARED_DEMO` إن أردت حالة مشتركة).
4. أي دفع إلى `main` ينشر الموقع تلقائيًا.

يعمل المشروع أيضًا على Vercel أو Netlify: الأمر `npm run build` والمجلد `out`، مع نفس المتغيرات.

## إعداد Supabase (مرة واحدة)
1. أنشئ مشروعًا مجانيًا على supabase.com.
2. SQL Editor ثم الصق محتوى `supabase/schema.sql` ثم Run.
3. Project Settings ثم API: انسخ **Project URL** و**anon public key** فقط.
4. ضعهما في `.env.local` محليًا (انظر `.env.example`) وفي متغيرات الاستضافة.

بدون هذه الخطوات يعمل الموقع كاملًا لكن التغييرات تضيع عند إعادة تحميل الصفحة.

## حسابات العرض
كلمة المرور `demo123`. طلاب: `std131` `std241` `std401` `std13`. خريج: `alm1`. مرشد: `sara` أو `majed`.
أصحاب العمل والجامعة بزر "دخول".
