export type StructureId =
  | "auto"
  | "claim-reason-example"
  | "problem-solution"
  | "chronological"
  | "compare-contrast";

export interface StructureOption {
  id: StructureId;
  label: string;
  description: string;
}

export const STRUCTURE_OPTIONS: StructureOption[] = [
  {
    id: "auto",
    label: "No constraint",
    description: "Just talk naturally — structure gets analyzed afterward, not enforced upfront.",
  },
  {
    id: "claim-reason-example",
    label: "Claim → Reason → Example → Conclusion",
    description: "State your position, explain why, give one concrete example, then wrap up.",
  },
  {
    id: "problem-solution",
    label: "Problem → Solution → Benefit",
    description: "Describe the problem, your solution, and why it matters.",
  },
  {
    id: "chronological",
    label: "Chronological (Then → Next → Now)",
    description: "Walk through what happened in order.",
  },
  {
    id: "compare-contrast",
    label: "Compare & Contrast",
    description: "Explain one side, then the other, then your takeaway.",
  },
];

const DEFAULT_STRUCTURE = STRUCTURE_OPTIONS[0];

export function getStructureOption(id: string | null | undefined): StructureOption {
  return STRUCTURE_OPTIONS.find((option) => option.id === id) ?? DEFAULT_STRUCTURE;
}
