-- STARTER SCHEMA ONLY. Review and test policies before production use.
-- Apply in the Supabase SQL editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists public.confessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 1000),
  category text not null default 'Other' check (category in ('Life','Relationships','Campus','Other')),
  is_shareable boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.confession_replies (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references public.confessions(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  is_reviewed boolean not null default false
);

alter table public.confessions enable row level security;
alter table public.confession_replies enable row level security;

-- Signed-in owners can manage only their own confessions.
drop policy if exists "Owners can read their confessions" on public.confessions;
create policy "Owners can read their confessions"
  on public.confessions for select to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "Owners can create confessions" on public.confessions;
create policy "Owners can create confessions"
  on public.confessions for insert to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their confessions" on public.confessions;
create policy "Owners can update their confessions"
  on public.confessions for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete their confessions" on public.confessions;
create policy "Owners can delete their confessions"
  on public.confessions for delete to authenticated
  using (auth.uid() = owner_id);

-- Public can read only a confession explicitly marked shareable.
drop policy if exists "Anyone can read shareable confessions" on public.confessions;
create policy "Anyone can read shareable confessions"
  on public.confessions for select to anon, authenticated
  using (is_shareable = true);

-- Owners can read replies only for confessions they own.
drop policy if exists "Owners can read replies to their confessions" on public.confession_replies;
create policy "Owners can read replies to their confessions"
  on public.confession_replies for select to authenticated
  using (exists (
    select 1 from public.confessions c
    where c.id = confession_id and c.owner_id = auth.uid()
  ));

-- IMPORTANT: Do not enable direct public INSERT for replies in production without
-- rate limiting, spam controls, moderation, and abuse prevention. Prefer a Supabase
-- Edge Function or trusted server endpoint to validate and insert public replies.
