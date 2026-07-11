export interface Prompt {
  id: string;
  text: string;
  category: "opinion" | "explain" | "story" | "belief";
}

export const SEED_PROMPTS: Prompt[] = [
  {
    id: "explain-recent-learning",
    text: "Explain something you learned recently.",
    category: "explain",
  },
  {
    id: "college-worth-it",
    text: "Is college still worth it?",
    category: "opinion",
  },
  {
    id: "explain-inflation",
    text: "Explain inflation to someone who has never studied economics.",
    category: "explain",
  },
  {
    id: "difficult-decision",
    text: "Tell a story about a difficult decision.",
    category: "story",
  },
  {
    id: "strong-belief",
    text: "Explain an idea you strongly believe in.",
    category: "belief",
  },
];

export function getRandomPrompt(excludeId?: string): Prompt {
  const pool = excludeId
    ? SEED_PROMPTS.filter((p) => p.id !== excludeId)
    : SEED_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
