create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.learning_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  workspace jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.learning_workspaces enable row level security;

create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "users can upsert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users can read own workspace"
on public.learning_workspaces
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own workspace"
on public.learning_workspaces
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own workspace"
on public.learning_workspaces
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
