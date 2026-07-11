import { Drill, DrillType } from "@/lib/types/analysis";

export const DRILL_TEMPLATES: Record<DrillType, Omit<Drill, "type">> = {
  lead_with_point: {
    label: "Lead With The Point",
    instructions:
      "Answer the same question again, but state your position in the first sentence.",
  },
  precision: {
    label: "Precision Drill",
    instructions:
      'Explain your point again without using the words "thing," "stuff," "something," or "you know."',
  },
  structure: {
    label: "Structure Drill",
    instructions: "Answer using exactly three parts: claim, reason, example.",
  },
  compression: {
    label: "Compression Drill",
    instructions: "Explain the same idea in 60 seconds.",
  },
};

export function getDrill(type: DrillType): Drill {
  return { type, ...DRILL_TEMPLATES[type] };
}
