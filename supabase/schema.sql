-- شغّل هذا الملف مرة واحدة في Supabase: SQL Editor ثم New query ثم Run
-- جدول واحد يحفظ حالة العرض التجريبي لكل متصفح (أو صفًا مشتركًا واحدًا).
-- لا توجد بيانات شخصية حقيقية: البيانات كلها تجريبية، لذلك يُسمح للزوار بالقراءة والكتابة.

create table if not exists public.portal_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portal_state enable row level security;

drop policy if exists "demo read"   on public.portal_state;
drop policy if exists "demo insert" on public.portal_state;
drop policy if exists "demo update" on public.portal_state;
drop policy if exists "demo delete" on public.portal_state;

create policy "demo read"   on public.portal_state for select to anon using (true);
create policy "demo insert" on public.portal_state for insert to anon with check (length(id) <= 64);
create policy "demo update" on public.portal_state for update to anon using (true) with check (length(id) <= 64);
create policy "demo delete" on public.portal_state for delete to anon using (true);
