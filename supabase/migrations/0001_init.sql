-- Prompts --------------------------------------------------------------
create table if not exists public.prompts (
  id text primary key,
  text text not null,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.prompts enable row level security;

create policy "Prompts are readable by everyone"
  on public.prompts for select
  using (true);

insert into public.prompts (id, text, category) values
  ('explain-recent-learning', 'Explain something you learned recently.', 'explain'),
  ('college-worth-it', 'Is college still worth it?', 'opinion'),
  ('explain-inflation', 'Explain inflation to someone who has never studied economics.', 'explain'),
  ('difficult-decision', 'Tell a story about a difficult decision.', 'story'),
  ('strong-belief', 'Explain an idea you strongly believe in.', 'belief')
on conflict (id) do nothing;

-- Sessions --------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id text references public.prompts(id),
  status text not null default 'started',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.sessions enable row level security;

create policy "Users manage their own sessions"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Recordings --------------------------------------------------------------
create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  attempt_number smallint not null check (attempt_number in (1, 2)),
  storage_path text,
  duration_seconds numeric,
  created_at timestamptz not null default now()
);

alter table public.recordings enable row level security;

create policy "Users manage recordings on their own sessions"
  on public.recordings for all
  using (exists (select 1 from public.sessions s where s.id = recordings.session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = recordings.session_id and s.user_id = auth.uid()));

-- Transcripts --------------------------------------------------------------
create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references public.recordings(id) on delete cascade,
  text text not null,
  word_count int,
  created_at timestamptz not null default now()
);

alter table public.transcripts enable row level security;

create policy "Users manage transcripts on their own recordings"
  on public.transcripts for all
  using (exists (
    select 1 from public.recordings r
    join public.sessions s on s.id = r.session_id
    where r.id = transcripts.recording_id and s.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.recordings r
    join public.sessions s on s.id = r.session_id
    where r.id = transcripts.recording_id and s.user_id = auth.uid()
  ));

-- AI analyses --------------------------------------------------------------
create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references public.recordings(id) on delete cascade,
  transcript_id uuid references public.transcripts(id) on delete cascade,
  main_point_summary text,
  structure_detected jsonb,
  structure_suggested jsonb,
  strongest_skill text,
  biggest_weakness text,
  weakness_type text,
  metrics jsonb,
  user_confirmed_meaning boolean,
  created_at timestamptz not null default now()
);

alter table public.ai_analyses enable row level security;

create policy "Users manage analyses on their own recordings"
  on public.ai_analyses for all
  using (exists (
    select 1 from public.recordings r
    join public.sessions s on s.id = r.session_id
    where r.id = ai_analyses.recording_id and s.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.recordings r
    join public.sessions s on s.id = r.session_id
    where r.id = ai_analyses.recording_id and s.user_id = auth.uid()
  ));

-- Drills --------------------------------------------------------------
create table if not exists public.drills (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  analysis_id uuid references public.ai_analyses(id) on delete cascade,
  drill_type text not null,
  instructions text not null,
  created_at timestamptz not null default now()
);

alter table public.drills enable row level security;

create policy "Users manage drills on their own sessions"
  on public.drills for all
  using (exists (select 1 from public.sessions s where s.id = drills.session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = drills.session_id and s.user_id = auth.uid()));

-- Attempt comparisons --------------------------------------------------------------
create table if not exists public.attempt_comparisons (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  analysis_1_id uuid references public.ai_analyses(id),
  analysis_2_id uuid references public.ai_analyses(id),
  summary text,
  metrics_diff jsonb,
  created_at timestamptz not null default now()
);

alter table public.attempt_comparisons enable row level security;

create policy "Users manage comparisons on their own sessions"
  on public.attempt_comparisons for all
  using (exists (select 1 from public.sessions s where s.id = attempt_comparisons.session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = attempt_comparisons.session_id and s.user_id = auth.uid()));

-- Storage: recordings bucket --------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

create policy "Users manage their own recording files"
  on storage.objects for all
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
