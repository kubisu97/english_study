create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  slot text not null unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.study_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  vocabulary_index integer not null default 0,
  grammar_index integer not null default 0,
  grammar_score integer not null default 0,
  conversation_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.study_progress enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
on public.profiles for select
to authenticated, anon
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "progress_select_own" on public.study_progress;
create policy "progress_select_own"
on public.study_progress for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "progress_insert_own" on public.study_progress;
create policy "progress_insert_own"
on public.study_progress for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.study_progress;
create policy "progress_update_own"
on public.study_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select
to authenticated, anon
using (bucket_id = 'avatars');

drop policy if exists "avatars_upload_own" on storage.objects;
create policy "avatars_upload_own"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
