-- Alarms --------------------------------------------------------------
create table if not exists public.alarms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  hour smallint not null check (hour between 0 and 23),
  minute smallint not null check (minute between 0 and 59),
  repeat_days smallint[] not null default '{}',
  enabled boolean not null default true,
  last_fired_on date,
  created_at timestamptz not null default now()
);

alter table public.alarms enable row level security;

create policy "Users manage their own alarms"
  on public.alarms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Multi-device sync: let clients subscribe to realtime changes on their own alarms.
alter publication supabase_realtime add table public.alarms;
