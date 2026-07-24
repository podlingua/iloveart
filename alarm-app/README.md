# Alarm

A simple alarm clock: set one or more alarms, optionally repeating on specific
days, that ring in the browser with sound and a notification. Alarms are
saved to Supabase so they persist and sync across devices.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required for
  alarms to be created and persisted. Without these the app shows a setup
  notice instead of the alarm list.

To set up Supabase:

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Authentication → Sign In / Providers**, enable **Anonymous sign-ins** —
   every visitor gets a real (anonymous) account automatically so their
   alarms can be saved, and can later add an email/password (`/save-progress`)
   to access them from other devices.
3. Run the SQL in `supabase/migrations/0001_init.sql` against your project
   (SQL editor, or `supabase db push` with the CLI). It creates the `alarms`
   table, its row-level security policies, and enables realtime so changes
   sync live across open tabs/devices.
4. Copy the project URL and anon key from **Project Settings → API** into
   `.env.local`.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- `app/page.tsx` — the alarm dashboard: create an alarm, toggle or delete
  existing ones.
- `hooks/useAlarms.ts` — loads alarms for the signed-in user, does CRUD
  against Supabase, and subscribes to realtime changes so other
  tabs/devices stay in sync.
- `hooks/useAlarmClock.ts` — ticks every second, matches the current time
  against enabled alarms, and drives the ringing state (with a 9-minute
  snooze, held in memory only).
- `lib/alarm/sound.ts` — generates the alarm tone with the Web Audio API, no
  audio file needed.
- `lib/supabase/AuthProvider.tsx` — auto anonymous sign-in, with
  `/save-progress` and `/sign-in` to attach a real account for cross-device
  access.
- `supabase/migrations/0001_init.sql` — schema, RLS, and realtime for the
  `alarms` table.

## Notes

- Alarms are checked against local device time (`Date.getHours()` /
  `getMinutes()`), so they ring at the same wall-clock time regardless of the
  device's timezone.
- The alarm only rings while a browser tab is open — this is a client-side
  timer, not a push notification service.
