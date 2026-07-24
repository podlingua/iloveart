# Rise — interactive prototype

A browser-based, remote-navigable prototype of **Rise**, the Fire TV morning
app described in the [full architecture doc](../). This is not the native
Fire TV app — it's a working demo of the *experience*: the alarm dashboard,
creating an alarm, and the wake sequence itself (brightness/volume fade-in,
generated ambient scenes, Snooze/Dismiss).

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Try the wake sequence right now

1. Create an alarm (any time, any scene).
2. Open it and press **Test alarm** — it fires the real wake sequence 3
   seconds later, the same code path a real firing uses.
3. Or just set the alarm's time to a minute from now and leave the tab open;
   the app checks the clock every second in the background, same as it
   would for a real alarm.

## Navigate with just a keyboard (D-pad stand-in)

Every screen is built around arrow-key + Enter navigation — no mouse
required — because on Fire TV the remote's D-pad *is* the only input. Focus
moves to the nearest element in the pressed direction (`hooks/useSpatialNav.ts`),
not DOM order, so it holds up across grids and mixed layouts. Opening this
page in a Fire TV's Silk browser and driving it with the real remote works
the same way.

## What's real vs. simplified here

- **Real**: the alarm scheduling loop, the fade-in choreography (brightness
  ramp + synthesized ambient audio via Web Audio, no audio files), Surprise
  Mode's no-repeat logic, the D-pad navigation model, snooze.
- **Simplified for a browser demo**: alarms only fire while the tab is open
  (a real Fire TV app uses `AlarmManager` at the OS level, per the
  architecture doc's §12); scenes are generated with CSS/canvas instead of
  filmed video; snooze is 15 seconds instead of 9 minutes so you can
  actually see it happen; there's no fallback chain to a guaranteed native
  tone if the browser tab itself is killed — that reliability engineering
  is native-app-specific and is what §12 of the architecture doc is for.

## Structure

- `lib/alarms.ts`, `hooks/useAlarms.ts` — alarm CRUD, localStorage-backed.
- `lib/trigger.ts`, `components/AlarmWatcher.tsx` — the scheduling loop:
  ticks every second, resolves Surprise Mode, navigates into the wake
  sequence, handles snooze re-firing.
- `lib/scenes.ts`, `components/scenes/` — the seven built-in scenes:
  gradient sky + canvas particle system (rain, stars, embers, motes) per
  scene, no video assets needed.
- `lib/sound.ts` — synthesized ambient pad + optional noise layer (rain
  patter / fire crackle) per scene, entirely generated audio.
- `app/wake/[id]/page.tsx` — the wake sequence itself.
