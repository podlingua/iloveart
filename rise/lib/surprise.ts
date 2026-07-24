import { SCENE_LIST, SceneId } from "@/lib/scenes";

const HISTORY_KEY = "rise.surprise-history.v1";
const LOOKBACK = 3; // never repeat anything shown in the last N picks

function loadHistory(): SceneId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SceneId[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: SceneId[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-10)));
}

export function pickSurprise(): SceneId {
  const history = loadHistory();
  const recent = new Set(history.slice(-LOOKBACK));
  const eligible = SCENE_LIST.filter((s) => !recent.has(s.id));
  const pool = eligible.length > 0 ? eligible : SCENE_LIST;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  saveHistory([...history, pick.id]);
  return pick.id;
}
