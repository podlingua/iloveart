# Speech Coach

An AI speech coach: speak, listen, get coached on one pattern at a time, practice a targeted drill, speak again, compare.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

- `OPENAI_API_KEY` — required. Powers transcription and coaching analysis.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — optional. Without these the core loop (record → transcribe → analyze → drill → compare) still works, but nothing is saved and there's no auth or history.

To enable persistence:

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Authentication → Sign In / Providers**, enable **Anonymous sign-ins** — every visitor gets a real (anonymous) account automatically so their session history can be saved, and can later add an email/password to keep it.
3. Run the SQL in `supabase/migrations/0001_init.sql` against your project (SQL editor, or `supabase db push` with the CLI). It creates the schema, row-level security policies, and a private `recordings` storage bucket.
4. Copy the project URL and anon key from **Project Settings → API** into `.env.local`.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `app/session/page.tsx` — the full record → transcribe → analyze → feedback → drill → record again → compare flow.
- `app/api/{transcribe,analyze,compare}` — OpenAI-backed routes.
- `lib/openai/` — transcription and structured-output coaching analysis.
- `lib/db/`, `hooks/useSessionPersistence.ts` — Supabase persistence (best-effort; failures never block the UI).
- `lib/supabase/AuthProvider.tsx` — auto anonymous sign-in, with `/save-progress` and `/sign-in` to attach a real account.
- `supabase/migrations/0001_init.sql` — full schema + RLS + storage bucket.
