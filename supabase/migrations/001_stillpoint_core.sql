create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'personal' check (role in ('personal','practitioner','admin')),
  plan text not null default 'free' check (plan in ('free','premium','practitioner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reiki_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes between 1 and 180),
  intention text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(body) <= 12000),
  created_at timestamptz not null default now()
);

create table if not exists public.body_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_id uuid references public.reiki_sessions(id) on delete set null,
  body_area text not null,
  sensation text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.practitioner_clients (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null,
  contact_email text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.practitioner_notes (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid not null references public.practitioner_clients(id) on delete cascade,
  body text not null check (char_length(body) <= 12000),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid references public.practitioner_clients(id) on delete set null,
  starts_at timestamptz not null,
  session_type text not null default 'reiki',
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.reiki_sessions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.body_observations enable row level security;
alter table public.practitioner_clients enable row level security;
alter table public.practitioner_notes enable row level security;
alter table public.appointments enable row level security;

create policy "profile_owner_select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profile_owner_insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profile_owner_update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "session_owner_all" on public.reiki_sessions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "journal_owner_all" on public.journal_entries for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "body_owner_all" on public.body_observations for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "client_practitioner_all" on public.practitioner_clients for all to authenticated using ((select auth.uid()) = practitioner_id) with check ((select auth.uid()) = practitioner_id);
create policy "note_practitioner_all" on public.practitioner_notes for all to authenticated using ((select auth.uid()) = practitioner_id) with check ((select auth.uid()) = practitioner_id);
create policy "appointment_practitioner_all" on public.appointments for all to authenticated using ((select auth.uid()) = practitioner_id) with check ((select auth.uid()) = practitioner_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.reiki_sessions, public.journal_entries, public.body_observations, public.practitioner_clients, public.practitioner_notes, public.appointments to authenticated;