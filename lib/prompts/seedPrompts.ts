export interface Prompt {
  id: string;
  text: string;
  category: "opinion" | "explain" | "story" | "belief" | "custom";
}

interface SeedPrompt {
  id: string;
  text: string;
  textEs: string;
  category: "opinion" | "explain" | "story" | "belief";
}

const SEED_PROMPTS: SeedPrompt[] = [
  {
    id: "explain-recent-learning",
    text: "Explain something you learned recently.",
    textEs: "Explica algo que aprendiste recientemente.",
    category: "explain",
  },
  {
    id: "college-worth-it",
    text: "Is college still worth it?",
    textEs: "¿Todavía vale la pena ir a la universidad?",
    category: "opinion",
  },
  {
    id: "explain-inflation",
    text: "Explain inflation to someone who has never studied economics.",
    textEs: "Explica la inflación a alguien que nunca ha estudiado economía.",
    category: "explain",
  },
  {
    id: "difficult-decision",
    text: "Tell a story about a difficult decision.",
    textEs: "Cuenta una historia sobre una decisión difícil.",
    category: "story",
  },
  {
    id: "strong-belief",
    text: "Explain an idea you strongly believe in.",
    textEs: "Explica una idea en la que crees firmemente.",
    category: "belief",
  },
];

export function getRandomPrompt(lang: "en" | "es" = "en", excludeId?: string): Prompt {
  const pool = excludeId ? SEED_PROMPTS.filter((p) => p.id !== excludeId) : SEED_PROMPTS;
  const seed = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: seed.id,
    text: lang === "es" ? seed.textEs : seed.text,
    category: seed.category,
  };
}

export const CUSTOM_PROMPT_ID = "custom";

export function createCustomPrompt(text: string): Prompt {
  return { id: CUSTOM_PROMPT_ID, text, category: "custom" };
}
