import { Drill, DrillType } from "@/lib/types/analysis";

interface DrillTemplate {
  label: string;
  instructions: string;
  labelEs: string;
  instructionsEs: string;
}

export const DRILL_TEMPLATES: Record<DrillType, DrillTemplate> = {
  lead_with_point: {
    label: "Lead With The Point",
    instructions:
      "Answer the same question again, but state your position in the first sentence.",
    labelEs: "Ve Directo al Punto",
    instructionsEs:
      "Responde la misma pregunta otra vez, pero indica tu postura en la primera oración.",
  },
  precision: {
    label: "Precision Drill",
    instructions:
      'Explain your point again without using the words "thing," "stuff," "something," or "you know."',
    labelEs: "Ejercicio de Precisión",
    instructionsEs:
      'Explica tu punto otra vez sin usar las palabras "cosa," "algo," o "o sea."',
  },
  structure: {
    label: "Structure Drill",
    instructions: "Answer using exactly three parts: claim, reason, example.",
    labelEs: "Ejercicio de Estructura",
    instructionsEs: "Responde usando exactamente tres partes: afirmación, razón, ejemplo.",
  },
  compression: {
    label: "Compression Drill",
    instructions: "Explain the same idea in 60 seconds.",
    labelEs: "Ejercicio de Compresión",
    instructionsEs: "Explica la misma idea en 60 segundos.",
  },
};

export function getDrill(type: DrillType, lang: "en" | "es" = "en"): Drill {
  const template = DRILL_TEMPLATES[type];
  return {
    type,
    label: lang === "es" ? template.labelEs : template.label,
    instructions: lang === "es" ? template.instructionsEs : template.instructions,
  };
}
