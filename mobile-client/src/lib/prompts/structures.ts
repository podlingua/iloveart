export interface StructureOption {
  id: string;
  label: string;
  description: string;
  group: string;
}

interface RawStructure {
  id: string;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
}

interface RawGroup {
  group: string;
  groupEs: string;
  options: RawStructure[];
}

const NO_CONSTRAINT: RawStructure = {
  id: "auto",
  label: "No constraint",
  labelEs: "Sin restricción",
  description: "Just talk naturally — structure gets analyzed afterward, not enforced upfront.",
  descriptionEs:
    "Simplemente habla con naturalidad — la estructura se analiza después, no se exige de antemano.",
};

const FOUNDATIONAL: RawStructure[] = [
  { id: "definition", label: "Definition", labelEs: "Definición", description: "Start by clearly defining the term or idea before explaining it further.", descriptionEs: "Empieza definiendo claramente el término o la idea antes de explicarla con más detalle." },
  { id: "pyramid", label: "Pyramid (Main Idea → Supporting Points)", labelEs: "Pirámide (Idea Principal → Puntos de Apoyo)", description: "State the main idea first, then back it up with supporting points.", descriptionEs: "Expón la idea principal primero, luego respáldala con puntos de apoyo." },
  { id: "rule-of-three", label: "Rule of Three", labelEs: "Regla de Tres", description: "Make your point using exactly three supporting elements.", descriptionEs: "Argumenta tu punto usando exactamente tres elementos de apoyo." },
  { id: "general-to-specific", label: "General → Specific", labelEs: "General → Específico", description: "Start broad, then narrow down to specific details.", descriptionEs: "Empieza de forma amplia y luego concreta en detalles específicos." },
  { id: "specific-to-general", label: "Specific → General", labelEs: "Específico → General", description: "Start with a specific detail, then zoom out to the general principle.", descriptionEs: "Empieza con un detalle específico y luego generaliza al principio más amplio." },
  { id: "first-principles", label: "First Principles", labelEs: "Principios Fundamentales", description: "Break the idea down to its most basic truths, then build up from there.", descriptionEs: "Descompón la idea en sus verdades más básicas y luego construye a partir de ahí." },
  { id: "parts-to-whole", label: "Parts → Whole", labelEs: "Partes → Todo", description: "Explain the individual pieces first, then how they combine into the whole.", descriptionEs: "Explica primero las piezas individuales y luego cómo se combinan en el todo." },
  { id: "whole-to-parts", label: "Whole → Parts", labelEs: "Todo → Partes", description: "Start with the big picture, then break it into its components.", descriptionEs: "Empieza con el panorama general y luego desglósalo en sus componentes." },
  { id: "framework", label: "Framework (3 Pillars, 5 Steps, etc.)", labelEs: "Marco (3 Pilares, 5 Pasos, etc.)", description: "Organize your answer around a named framework with a fixed number of parts.", descriptionEs: "Organiza tu respuesta alrededor de un marco con un número fijo de partes." },
  { id: "mental-models", label: "Mental Models", labelEs: "Modelos Mentales", description: "Explain the idea through a known mental model or way of thinking.", descriptionEs: "Explica la idea a través de un modelo mental conocido." },
  { id: "definition-example-non-example", label: "Definition → Example → Non-Example", labelEs: "Definición → Ejemplo → No-Ejemplo", description: "Define the term, give an example, then a non-example to sharpen the boundary.", descriptionEs: "Define el término, da un ejemplo y luego un no-ejemplo para precisar el límite." },
];

const TIME_AND_SEQUENCE: RawStructure[] = [
  { id: "past-present-future", label: "Past → Present → Future", labelEs: "Pasado → Presente → Futuro", description: "Explain where things stood, where they are now, and where they're headed.", descriptionEs: "Explica cómo estaban las cosas, cómo están ahora y hacia dónde se dirigen." },
  { id: "chronological-timeline", label: "Chronological Timeline", labelEs: "Línea de Tiempo Cronológica", description: "Walk through events strictly in the order they happened.", descriptionEs: "Recorre los eventos estrictamente en el orden en que ocurrieron." },
  { id: "process-step-by-step", label: "Process (Step-by-Step)", labelEs: "Proceso (Paso a Paso)", description: "Break the explanation into ordered steps.", descriptionEs: "Divide la explicación en pasos ordenados." },
  { id: "historical-evolution", label: "Historical Evolution", labelEs: "Evolución Histórica", description: "Explain how the idea or situation evolved over time.", descriptionEs: "Explica cómo evolucionó la idea o la situación con el tiempo." },
  { id: "prediction-forecast", label: "Prediction & Forecast", labelEs: "Predicción y Pronóstico", description: "Explain the current state, then forecast what happens next.", descriptionEs: "Explica el estado actual y luego pronostica qué sucederá." },
  { id: "sequential-layers", label: "Sequential Layers (Surface → Deeper → Deepest)", labelEs: "Capas Secuenciales (Superficie → Más Profundo → Lo Más Profundo)", description: "Peel back layers from the surface explanation to the deepest one.", descriptionEs: "Ve retirando capas desde la explicación superficial hasta la más profunda." },
  { id: "before-after", label: "Before & After", labelEs: "Antes y Después", description: "Describe the state before, then after, highlighting the change.", descriptionEs: "Describe el estado anterior y luego el posterior, resaltando el cambio." },
];

const CAUSE_PROBLEM_SOLUTION: RawStructure[] = [
  { id: "problem-cause-solution", label: "Problem → Cause → Solution", labelEs: "Problema → Causa → Solución", description: "State the problem, explain its cause, then propose a solution.", descriptionEs: "Plantea el problema, explica su causa y luego propone una solución." },
  { id: "cause-effect", label: "Cause → Effect", labelEs: "Causa → Efecto", description: "Explain a cause, then its effect.", descriptionEs: "Explica una causa y luego su efecto." },
  { id: "effect-cause", label: "Effect → Cause", labelEs: "Efecto → Causa", description: "Start with the effect, then work backward to explain its cause.", descriptionEs: "Empieza con el efecto y retrocede para explicar su causa." },
  { id: "five-whys", label: "Five Whys", labelEs: "Los Cinco Porqués", description: "Ask \"why\" repeatedly to drill down to the root cause.", descriptionEs: 'Pregunta "por qué" repetidamente para llegar a la causa raíz.' },
  { id: "root-cause-analysis", label: "Root Cause Analysis", labelEs: "Análisis de Causa Raíz", description: "Trace the problem back to its underlying root cause.", descriptionEs: "Rastrea el problema hasta su causa subyacente." },
  { id: "trigger-action-consequence", label: "Trigger → Action → Consequence", labelEs: "Detonante → Acción → Consecuencia", description: "Describe the trigger, the action taken, and the consequence.", descriptionEs: "Describe el detonante, la acción tomada y la consecuencia." },
  { id: "goal-obstacle-solution", label: "Goal → Obstacle → Solution", labelEs: "Meta → Obstáculo → Solución", description: "State the goal, the obstacle in the way, and the solution.", descriptionEs: "Plantea la meta, el obstáculo en el camino y la solución." },
  { id: "challenge-attempt-outcome", label: "Challenge → Attempt → Outcome", labelEs: "Desafío → Intento → Resultado", description: "Describe the challenge, what was attempted, and the outcome.", descriptionEs: "Describe el desafío, lo que se intentó y el resultado." },
  { id: "goal-strategy-execution", label: "Goal → Strategy → Execution", labelEs: "Meta → Estrategia → Ejecución", description: "State the goal, the strategy, and how it was executed.", descriptionEs: "Plantea la meta, la estrategia y cómo se ejecutó." },
];

const ARGUMENT_AND_EVIDENCE: RawStructure[] = [
  { id: "claim-evidence-conclusion", label: "Claim → Evidence → Conclusion", labelEs: "Afirmación → Evidencia → Conclusión", description: "State your claim, back it with evidence, then conclude.", descriptionEs: "Plantea tu afirmación, respáldala con evidencia y luego concluye." },
  { id: "thesis-arguments-summary", label: "Thesis → Arguments → Summary", labelEs: "Tesis → Argumentos → Resumen", description: "State your thesis, lay out supporting arguments, then summarize.", descriptionEs: "Plantea tu tesis, expón los argumentos de apoyo y luego resume." },
  { id: "debate-structure", label: "Debate Structure", labelEs: "Estructura de Debate", description: "Present one side, then the opposing side, then your judgment.", descriptionEs: "Presenta un lado, luego el lado opuesto y después tu juicio." },
  { id: "counterargument-rebuttal", label: "Counterargument → Rebuttal", labelEs: "Contraargumento → Refutación", description: "State the strongest counterargument, then rebut it.", descriptionEs: "Plantea el contraargumento más fuerte y luego refútalo." },
  { id: "myth-vs-reality", label: "Myth vs. Reality", labelEs: "Mito vs. Realidad", description: "State the common myth, then contrast it with reality.", descriptionEs: "Plantea el mito común y luego contrástalo con la realidad." },
  { id: "question-answer", label: "Question → Answer", labelEs: "Pregunta → Respuesta", description: "Pose the key question directly, then answer it.", descriptionEs: "Plantea la pregunta clave directamente y luego respóndela." },
  { id: "socratic-method", label: "Socratic Method", labelEs: "Método Socrático", description: "Guide toward the answer through a sequence of questions.", descriptionEs: "Guía hacia la respuesta a través de una secuencia de preguntas." },
];

const COMPARISON: RawStructure[] = [
  { id: "compare-contrast", label: "Compare & Contrast", labelEs: "Comparar y Contrastar", description: "Explain one side, then the other, then your takeaway.", descriptionEs: "Explica un lado, luego el otro y después tu conclusión." },
  { id: "pros-cons", label: "Pros & Cons", labelEs: "Pros y Contras", description: "List the pros, then the cons, then weigh them.", descriptionEs: "Enumera los pros, luego los contras y después sopésalos." },
  { id: "compare-across-dimensions", label: "Compare Across Dimensions (Cost, Speed, Quality, etc.)", labelEs: "Comparar en Varias Dimensiones (Costo, Velocidad, Calidad, etc.)", description: "Compare the options across specific named dimensions.", descriptionEs: "Compara las opciones a lo largo de dimensiones específicas." },
  { id: "multi-perspective", label: "Multi-Perspective (Economic, Social, Ethical, etc.)", labelEs: "Multi-Perspectiva (Económica, Social, Ética, etc.)", description: "Explain the idea from multiple distinct perspectives.", descriptionEs: "Explica la idea desde varias perspectivas distintas." },
  { id: "swot", label: "SWOT (Strengths, Weaknesses, Opportunities, Threats)", labelEs: "FODA (Fortalezas, Oportunidades, Debilidades, Amenazas)", description: "Cover strengths, weaknesses, opportunities, and threats.", descriptionEs: "Cubre fortalezas, debilidades, oportunidades y amenazas." },
  { id: "pestle", label: "PESTLE (Political, Economic, Social, Technological, Legal, Environmental)", labelEs: "PESTEL (Político, Económico, Social, Tecnológico, Legal, Ambiental)", description: "Cover political, economic, social, technological, legal, and environmental factors.", descriptionEs: "Cubre los factores políticos, económicos, sociales, tecnológicos, legales y ambientales." },
];

const TEACHING_AND_EXPLAINING: RawStructure[] = [
  { id: "eli5", label: "Explain Like I'm Five (ELI5)", labelEs: "Explícalo Como Si Tuviera Cinco Años", description: "Explain it as simply as possible, assuming no prior knowledge.", descriptionEs: "Explícalo de la forma más simple posible, sin asumir conocimiento previo." },
  { id: "layered-explanation", label: "Layered Explanation (Beginner → Intermediate → Expert)", labelEs: "Explicación por Capas (Principiante → Intermedio → Experto)", description: "Explain at a beginner level, then intermediate, then expert depth.", descriptionEs: "Explica a nivel principiante, luego intermedio y luego experto." },
  { id: "teaching-mode", label: "Teaching Mode", labelEs: "Modo Enseñanza", description: "Explain as if directly teaching someone the concept step by step.", descriptionEs: "Explica como si estuvieras enseñando el concepto paso a paso a alguien." },
  { id: "feynman-method", label: "Feynman Method", labelEs: "Método Feynman", description: "Explain it so simply that a child could understand, then check for gaps.", descriptionEs: "Explícalo con tanta sencillez que un niño lo entendería, y luego revisa los vacíos." },
  { id: "faq-format", label: "FAQ Format", labelEs: "Formato de Preguntas Frecuentes", description: "Answer it as a list of common questions and their answers.", descriptionEs: "Respóndelo como una lista de preguntas frecuentes y sus respuestas." },
  { id: "chunking", label: "Chunking (Small Sections)", labelEs: "Fragmentación (Secciones Pequeñas)", description: "Break the explanation into small, digestible sections.", descriptionEs: "Divide la explicación en secciones pequeñas y digeribles." },
  { id: "analogy-builder", label: "Analogy Builder", labelEs: "Constructor de Analogías", description: "Explain the idea by building an analogy to something more familiar.", descriptionEs: "Explica la idea construyendo una analogía con algo más familiar." },
  { id: "metaphor-explanation", label: "Metaphor Explanation", labelEs: "Explicación por Metáfora", description: "Use a single extended metaphor to carry the explanation.", descriptionEs: "Usa una sola metáfora extendida para llevar la explicación." },
  { id: "analytic-breakdown", label: "Analytic Breakdown (Component-by-Component)", labelEs: "Desglose Analítico (Componente por Componente)", description: "Break the whole down and explain it component by component.", descriptionEs: "Descompón el todo y explícalo componente por componente." },
  { id: "synthesis", label: "Synthesis (Combine Multiple Ideas)", labelEs: "Síntesis (Combinar Varias Ideas)", description: "Combine multiple separate ideas into one unified explanation.", descriptionEs: "Combina varias ideas separadas en una sola explicación unificada." },
];

const NARRATIVE_AND_STORY: RawStructure[] = [
  { id: "storytelling", label: "Storytelling", labelEs: "Narración de Historias", description: "Explain the idea as a story with characters, tension, and resolution.", descriptionEs: "Explica la idea como una historia con personajes, tensión y resolución." },
  { id: "case-study", label: "Case Study", labelEs: "Estudio de Caso", description: "Walk through one real or hypothetical case in detail.", descriptionEs: "Recorre un caso real o hipotético con detalle." },
  { id: "real-world-example", label: "Real-World Example", labelEs: "Ejemplo del Mundo Real", description: "Ground the idea in a concrete real-world example.", descriptionEs: "Sustenta la idea con un ejemplo concreto del mundo real." },
  { id: "personal-experience", label: "Personal Experience", labelEs: "Experiencia Personal", description: "Explain the idea through your own firsthand experience.", descriptionEs: "Explica la idea a través de tu propia experiencia directa." },
  { id: "hook-explanation-takeaway", label: "Hook → Explanation → Takeaway", labelEs: "Gancho → Explicación → Conclusión Clave", description: "Open with a hook, explain the idea, then end with a takeaway.", descriptionEs: "Abre con un gancho, explica la idea y termina con una conclusión clave." },
  { id: "hook-story-lesson", label: "Hook → Story → Lesson", labelEs: "Gancho → Historia → Lección", description: "Open with a hook, tell a story, then draw out the lesson.", descriptionEs: "Abre con un gancho, cuenta una historia y luego extrae la lección." },
  { id: "situation-complication-resolution", label: "Situation → Complication → Resolution", labelEs: "Situación → Complicación → Resolución", description: "Set up the situation, introduce the complication, then resolve it.", descriptionEs: "Plantea la situación, introduce la complicación y luego resuélvela." },
  { id: "context-conflict-conclusion", label: "Context → Conflict → Conclusion", labelEs: "Contexto → Conflicto → Conclusión", description: "Establish context, introduce the conflict, then conclude.", descriptionEs: "Establece el contexto, introduce el conflicto y luego concluye." },
  { id: "open-loop-build-close-loop", label: "Open Loop → Build → Close Loop", labelEs: "Bucle Abierto → Desarrollo → Cierre del Bucle", description: "Open a curiosity gap, build through the explanation, then close the loop.", descriptionEs: "Abre un vacío de curiosidad, desarróllalo a través de la explicación y luego ciérralo." },
];

const SYSTEMS_AND_STRUCTURE: RawStructure[] = [
  { id: "systems-thinking", label: "Systems Thinking", labelEs: "Pensamiento Sistémico", description: "Explain how the parts interact as an interconnected system, not in isolation.", descriptionEs: "Explica cómo interactúan las partes como un sistema interconectado, no de forma aislada." },
  { id: "tree-structure", label: "Tree Structure", labelEs: "Estructura de Árbol", description: "Branch from a root idea into sub-branches of increasing detail.", descriptionEs: "Ramifica desde una idea raíz hacia sub-ramas de mayor detalle." },
  { id: "decision-tree", label: "Decision Tree", labelEs: "Árbol de Decisión", description: "Walk through a sequence of if/then branching decisions.", descriptionEs: "Recorre una secuencia de decisiones ramificadas de tipo si/entonces." },
  { id: "concept-map", label: "Concept Map", labelEs: "Mapa Conceptual", description: "Explain the idea by describing how concepts connect to each other.", descriptionEs: "Explica la idea describiendo cómo se conectan los conceptos entre sí." },
  { id: "inputs-process-outputs", label: "Inputs → Process → Outputs", labelEs: "Entradas → Proceso → Salidas", description: "Describe the inputs, the process, and the resulting outputs.", descriptionEs: "Describe las entradas, el proceso y las salidas resultantes." },
  { id: "feedback-loop", label: "Feedback Loop", labelEs: "Bucle de Retroalimentación", description: "Explain the idea as a cycle where outputs feed back into inputs.", descriptionEs: "Explica la idea como un ciclo donde las salidas retroalimentan las entradas." },
  { id: "classification", label: "Classification (Categories & Types)", labelEs: "Clasificación (Categorías y Tipos)", description: "Organize the explanation into distinct categories or types.", descriptionEs: "Organiza la explicación en categorías o tipos distintos." },
  { id: "ranking", label: "Ranking (Best → Worst)", labelEs: "Clasificación por Ranking (Mejor → Peor)", description: "Order the items from best to worst with reasoning.", descriptionEs: "Ordena los elementos de mejor a peor con su razonamiento." },
  { id: "checklist-format", label: "Checklist Format", labelEs: "Formato de Lista de Verificación", description: "Present the explanation as a checklist of items.", descriptionEs: "Presenta la explicación como una lista de verificación." },
];

const ABSTRACTION_LEVEL: RawStructure[] = [
  { id: "abstract-to-concrete", label: "Abstract → Concrete", labelEs: "Abstracto → Concreto", description: "Start with the abstract idea, then ground it in something concrete.", descriptionEs: "Empieza con la idea abstracta y luego fundaméntala en algo concreto." },
  { id: "concrete-to-abstract", label: "Concrete → Abstract", labelEs: "Concreto → Abstracto", description: "Start with a concrete example, then generalize to the abstract idea.", descriptionEs: "Empieza con un ejemplo concreto y luego generaliza a la idea abstracta." },
  { id: "simple-to-complex", label: "Simple → Complex", labelEs: "Simple → Complejo", description: "Start with the simplest version, then add complexity.", descriptionEs: "Empieza con la versión más simple y luego añade complejidad." },
  { id: "complex-to-simple", label: "Complex → Simple", labelEs: "Complejo → Simple", description: "Start with the full complexity, then distill it to something simple.", descriptionEs: "Empieza con toda la complejidad y luego destílala a algo simple." },
  { id: "inside-out", label: "Inside-Out (Core Idea → External Effects)", labelEs: "De Adentro Hacia Afuera (Idea Central → Efectos Externos)", description: "Start from the core idea, then explain its outward effects.", descriptionEs: "Empieza desde la idea central y luego explica sus efectos hacia afuera." },
  { id: "outside-in", label: "Outside-In (Context → Details → Core Idea)", labelEs: "De Afuera Hacia Adentro (Contexto → Detalles → Idea Central)", description: "Start from the surrounding context, then narrow in on the core idea.", descriptionEs: "Empieza desde el contexto circundante y luego enfócate en la idea central." },
];

const ANALYTICAL_FRAMEWORKS: RawStructure[] = [
  { id: "observation-insight-action", label: "Observation → Insight → Action", labelEs: "Observación → Percepción → Acción", description: "Start from an observation, draw an insight, then recommend an action.", descriptionEs: "Parte de una observación, extrae una percepción y luego recomienda una acción." },
  { id: "observation-pattern-principle", label: "Observation → Pattern → Principle", labelEs: "Observación → Patrón → Principio", description: "Start from an observation, identify the pattern, then state the principle.", descriptionEs: "Parte de una observación, identifica el patrón y luego plantea el principio." },
  { id: "fact-interpretation-implication", label: "Fact → Interpretation → Implication", labelEs: "Hecho → Interpretación → Implicación", description: "State the fact, interpret it, then explain its implication.", descriptionEs: "Plantea el hecho, interprétalo y luego explica su implicación." },
  { id: "signal-noise", label: "Signal → Noise (Separate Important from Unimportant)", labelEs: "Señal → Ruido (Separar lo Importante de lo Irrelevante)", description: "Separate what actually matters from what doesn't.", descriptionEs: "Separa lo que realmente importa de lo que no." },
  { id: "hypothesis-test-result", label: "Hypothesis → Test → Result", labelEs: "Hipótesis → Prueba → Resultado", description: "State a hypothesis, how it was tested, and the result.", descriptionEs: "Plantea una hipótesis, cómo se probó y el resultado." },
  { id: "question-investigation-discovery", label: "Question → Investigation → Discovery", labelEs: "Pregunta → Investigación → Descubrimiento", description: "Pose a question, describe the investigation, then the discovery.", descriptionEs: "Plantea una pregunta, describe la investigación y luego el descubrimiento." },
  { id: "decision-framework", label: "Decision Framework (If X, Then Y)", labelEs: "Marco de Decisión (Si X, Entonces Y)", description: "Frame the explanation as a set of if/then decision rules.", descriptionEs: "Enmarca la explicación como un conjunto de reglas de decisión de tipo si/entonces." },
  { id: "principle-example-application", label: "Principle → Example → Application", labelEs: "Principio → Ejemplo → Aplicación", description: "State the principle, illustrate it with an example, then apply it.", descriptionEs: "Plantea el principio, ilústralo con un ejemplo y luego aplícalo." },
  { id: "common-mistakes-corrections", label: "Common Mistakes → Corrections", labelEs: "Errores Comunes → Correcciones", description: "List common mistakes, then the correct approach for each.", descriptionEs: "Enumera errores comunes y luego el enfoque correcto para cada uno." },
  { id: "analogy-counterexample", label: "Analogy + Counterexample", labelEs: "Analogía + Contraejemplo", description: "Use an analogy, then a counterexample to sharpen the point.", descriptionEs: "Usa una analogía y luego un contraejemplo para afinar el punto." },
];

const COMMUNICATION_FORMATS: RawStructure[] = [
  { id: "inverted-pyramid", label: "Inverted Pyramid (Journalism)", labelEs: "Pirámide Invertida (Periodismo)", description: "Lead with the most important information, then add supporting detail.", descriptionEs: "Empieza con la información más importante y luego añade detalles de apoyo." },
  { id: "news-report", label: "News Report (Who, What, When, Where, Why, How)", labelEs: "Reporte Noticioso (Quién, Qué, Cuándo, Dónde, Por Qué, Cómo)", description: "Cover who, what, when, where, why, and how.", descriptionEs: "Cubre quién, qué, cuándo, dónde, por qué y cómo." },
  { id: "elevator-pitch", label: "Elevator Pitch (30 sec / 60 sec / 2 min)", labelEs: "Discurso de Ascensor (30 seg / 60 seg / 2 min)", description: "Compress the idea into a tight, persuasive pitch.", descriptionEs: "Comprime la idea en un discurso breve y persuasivo." },
  { id: "why-how-what", label: "Why → How → What", labelEs: "Por Qué → Cómo → Qué", description: "Start with why it matters, then how it works, then what it is.", descriptionEs: "Empieza por qué importa, luego cómo funciona y luego qué es." },
  { id: "what-why-how", label: "What → Why → How", labelEs: "Qué → Por Qué → Cómo", description: "Start with what it is, then why it matters, then how it works.", descriptionEs: "Empieza con qué es, luego por qué importa y luego cómo funciona." },
  { id: "data-driven", label: "Data-Driven Explanation", labelEs: "Explicación Basada en Datos", description: "Lead with data and evidence to support each point.", descriptionEs: "Lidera con datos y evidencia para respaldar cada punto." },
];

const RAW_GROUPS: RawGroup[] = [
  { group: "Default", groupEs: "Default", options: [NO_CONSTRAINT] },
  { group: "Foundational", groupEs: "Fundamentales", options: FOUNDATIONAL },
  { group: "Time & Sequence", groupEs: "Tiempo y Secuencia", options: TIME_AND_SEQUENCE },
  { group: "Cause, Problem & Solution", groupEs: "Causa, Problema y Solución", options: CAUSE_PROBLEM_SOLUTION },
  { group: "Argument & Evidence", groupEs: "Argumento y Evidencia", options: ARGUMENT_AND_EVIDENCE },
  { group: "Comparison", groupEs: "Comparación", options: COMPARISON },
  { group: "Teaching & Explaining", groupEs: "Enseñanza y Explicación", options: TEACHING_AND_EXPLAINING },
  { group: "Narrative & Story", groupEs: "Narrativa e Historia", options: NARRATIVE_AND_STORY },
  { group: "Systems & Structure", groupEs: "Sistemas y Estructura", options: SYSTEMS_AND_STRUCTURE },
  { group: "Abstraction Level", groupEs: "Nivel de Abstracción", options: ABSTRACTION_LEVEL },
  { group: "Analytical Frameworks", groupEs: "Marcos Analíticos", options: ANALYTICAL_FRAMEWORKS },
  { group: "Communication Formats", groupEs: "Formatos de Comunicación", options: COMMUNICATION_FORMATS },
];

const ALL_RAW: RawStructure[] = RAW_GROUPS.flatMap((g) => g.options);

export function getStructureGroups(lang: "en" | "es" = "en"): { group: string; options: StructureOption[] }[] {
  return RAW_GROUPS.map((g) => ({
    group: lang === "es" ? g.groupEs : g.group,
    options: g.options.map((o) => ({
      id: o.id,
      label: lang === "es" ? o.labelEs : o.label,
      description: lang === "es" ? o.descriptionEs : o.description,
      group: lang === "es" ? g.groupEs : g.group,
    })),
  }));
}

export function getStructureOption(id: string | null | undefined, lang: "en" | "es" = "en"): StructureOption {
  const raw = ALL_RAW.find((option) => option.id === id) ?? NO_CONSTRAINT;
  const group = RAW_GROUPS.find((g) => g.options.includes(raw))!;
  return {
    id: raw.id,
    label: lang === "es" ? raw.labelEs : raw.label,
    description: lang === "es" ? raw.descriptionEs : raw.description,
    group: lang === "es" ? group.groupEs : group.group,
  };
}
