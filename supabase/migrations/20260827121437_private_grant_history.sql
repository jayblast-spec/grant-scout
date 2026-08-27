-- Future authenticated, explicit-opt-in history. The current public demo does
-- not write to or read from this table.
create table if not exists public.grant_scout_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  question text not null check (char_length(question) between 1 and 1000),
  answer text not null check (char_length(answer) between 1 and 8000),
  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  check (expires_at > created_at)
);

alter table public.grant_scout_searches enable row level security;
alter table public.grant_scout_searches force row level security;

revoke all on table public.grant_scout_searches from anon;
revoke all on table public.grant_scout_searches from authenticated;
grant select, insert, delete on table public.grant_scout_searches to authenticated;

drop policy if exists "owners can read unexpired grant history" on public.grant_scout_searches;
create policy "owners can read unexpired grant history"
on public.grant_scout_searches for select to authenticated
using ((select auth.uid()) = user_id and expires_at > now());

drop policy if exists "owners can opt in to grant history" on public.grant_scout_searches;
create policy "owners can opt in to grant history"
on public.grant_scout_searches for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "owners can delete grant history" on public.grant_scout_searches;
create policy "owners can delete grant history"
on public.grant_scout_searches for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists grant_scout_searches_owner_created_idx
  on public.grant_scout_searches (user_id, created_at desc);
create index if not exists grant_scout_searches_expiry_idx
  on public.grant_scout_searches (expires_at);

-- Run this from a trusted scheduled backend at least daily:
-- delete from public.grant_scout_searches where expires_at <= now();
