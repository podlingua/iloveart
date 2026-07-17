export interface StructureOption {
  id: string;
  label: string;
  description: string;
  group: string;
}

const NO_CONSTRAINT: StructureOption = {
  id: "auto",
  label: "No constraint",
  description: "Just talk naturally — structure gets analyzed afterward, not enforced upfront.",
  group: "Default",
};

const FOUNDATIONAL: StructureOption[] = [
  { id: "definition", label: "Definition", description: "Start by clearly defining the term or idea before explaining it further." },
  { id: "pyramid", label: "Pyramid (Main Idea → Supporting Points)", description: "State the main idea first, then back it up with supporting points." },
  { id: "rule-of-three", label: "Rule of Three", description: "Make your point using exactly three supporting elements." },
  { id: "general-to-specific", label: "General → Specific", description: "Start broad, then narrow down to specific details." },
  { id: "specific-to-general", label: "Specific → General", description: "Start with a specific detail, then zoom out to the general principle." },
  { id: "first-principles", label: "First Principles", description: "Break the idea down to its most basic truths, then build up from there." },
  { id: "parts-to-whole", label: "Parts → Whole", description: "Explain the individual pieces first, then how they combine into the whole." },
  { id: "whole-to-parts", label: "Whole → Parts", description: "Start with the big picture, then break it into its components." },
  { id: "framework", label: "Framework (3 Pillars, 5 Steps, etc.)", description: "Organize your answer around a named framework with a fixed number of parts." },
  { id: "mental-models", label: "Mental Models", description: "Explain the idea through a known mental model or way of thinking." },
  { id: "definition-example-non-example", label: "Definition → Example → Non-Example", description: "Define the term, give an example, then a non-example to sharpen the boundary." },
].map((o) => ({ ...o, group: "Foundational" }));

const TIME_AND_SEQUENCE: StructureOption[] = [
  { id: "past-present-future", label: "Past → Present → Future", description: "Explain where things stood, where they are now, and where they're headed." },
  { id: "chronological-timeline", label: "Chronological Timeline", description: "Walk through events strictly in the order they happened." },
  { id: "process-step-by-step", label: "Process (Step-by-Step)", description: "Break the explanation into ordered steps." },
  { id: "historical-evolution", label: "Historical Evolution", description: "Explain how the idea or situation evolved over time." },
  { id: "prediction-forecast", label: "Prediction & Forecast", description: "Explain the current state, then forecast what happens next." },
  { id: "sequential-layers", label: "Sequential Layers (Surface → Deeper → Deepest)", description: "Peel back layers from the surface explanation to the deepest one." },
  { id: "before-after", label: "Before & After", description: "Describe the state before, then after, highlighting the change." },
].map((o) => ({ ...o, group: "Time & Sequence" }));

const CAUSE_PROBLEM_SOLUTION: StructureOption[] = [
  { id: "problem-cause-solution", label: "Problem → Cause → Solution", description: "State the problem, explain its cause, then propose a solution." },
  { id: "cause-effect", label: "Cause → Effect", description: "Explain a cause, then its effect." },
  { id: "effect-cause", label: "Effect → Cause", description: "Start with the effect, then work backward to explain its cause." },
  { id: "five-whys", label: "Five Whys", description: 'Ask "why" repeatedly to drill down to the root cause.' },
  { id: "root-cause-analysis", label: "Root Cause Analysis", description: "Trace the problem back to its underlying root cause." },
  { id: "trigger-action-consequence", label: "Trigger → Action → Consequence", description: "Describe the trigger, the action taken, and the consequence." },
  { id: "goal-obstacle-solution", label: "Goal → Obstacle → Solution", description: "State the goal, the obstacle in the way, and the solution." },
  { id: "challenge-attempt-outcome", label: "Challenge → Attempt → Outcome", description: "Describe the challenge, what was attempted, and the outcome." },
  { id: "goal-strategy-execution", label: "Goal → Strategy → Execution", description: "State the goal, the strategy, and how it was executed." },
].map((o) => ({ ...o, group: "Cause, Problem & Solution" }));

const ARGUMENT_AND_EVIDENCE: StructureOption[] = [
  { id: "claim-evidence-conclusion", label: "Claim → Evidence → Conclusion", description: "State your claim, back it with evidence, then conclude." },
  { id: "thesis-arguments-summary", label: "Thesis → Arguments → Summary", description: "State your thesis, lay out supporting arguments, then summarize." },
  { id: "debate-structure", label: "Debate Structure", description: "Present one side, then the opposing side, then your judgment." },
  { id: "counterargument-rebuttal", label: "Counterargument → Rebuttal", description: "State the strongest counterargument, then rebut it." },
  { id: "myth-vs-reality", label: "Myth vs. Reality", description: "State the common myth, then contrast it with reality." },
  { id: "question-answer", label: "Question → Answer", description: "Pose the key question directly, then answer it." },
  { id: "socratic-method", label: "Socratic Method", description: "Guide toward the answer through a sequence of questions." },
].map((o) => ({ ...o, group: "Argument & Evidence" }));

const COMPARISON: StructureOption[] = [
  { id: "compare-contrast", label: "Compare & Contrast", description: "Explain one side, then the other, then your takeaway." },
  { id: "pros-cons", label: "Pros & Cons", description: "List the pros, then the cons, then weigh them." },
  { id: "compare-across-dimensions", label: "Compare Across Dimensions (Cost, Speed, Quality, etc.)", description: "Compare the options across specific named dimensions." },
  { id: "multi-perspective", label: "Multi-Perspective (Economic, Social, Ethical, etc.)", description: "Explain the idea from multiple distinct perspectives." },
  { id: "swot", label: "SWOT (Strengths, Weaknesses, Opportunities, Threats)", description: "Cover strengths, weaknesses, opportunities, and threats." },
  { id: "pestle", label: "PESTLE (Political, Economic, Social, Technological, Legal, Environmental)", description: "Cover political, economic, social, technological, legal, and environmental factors." },
].map((o) => ({ ...o, group: "Comparison" }));

const TEACHING_AND_EXPLAINING: StructureOption[] = [
  { id: "eli5", label: "Explain Like I'm Five (ELI5)", description: "Explain it as simply as possible, assuming no prior knowledge." },
  { id: "layered-explanation", label: "Layered Explanation (Beginner → Intermediate → Expert)", description: "Explain at a beginner level, then intermediate, then expert depth." },
  { id: "teaching-mode", label: "Teaching Mode", description: "Explain as if directly teaching someone the concept step by step." },
  { id: "feynman-method", label: "Feynman Method", description: "Explain it so simply that a child could understand, then check for gaps." },
  { id: "faq-format", label: "FAQ Format", description: "Answer it as a list of common questions and their answers." },
  { id: "chunking", label: "Chunking (Small Sections)", description: "Break the explanation into small, digestible sections." },
  { id: "analogy-builder", label: "Analogy Builder", description: "Explain the idea by building an analogy to something more familiar." },
  { id: "metaphor-explanation", label: "Metaphor Explanation", description: "Use a single extended metaphor to carry the explanation." },
  { id: "analytic-breakdown", label: "Analytic Breakdown (Component-by-Component)", description: "Break the whole down and explain it component by component." },
  { id: "synthesis", label: "Synthesis (Combine Multiple Ideas)", description: "Combine multiple separate ideas into one unified explanation." },
].map((o) => ({ ...o, group: "Teaching & Explaining" }));

const NARRATIVE_AND_STORY: StructureOption[] = [
  { id: "storytelling", label: "Storytelling", description: "Explain the idea as a story with characters, tension, and resolution." },
  { id: "case-study", label: "Case Study", description: "Walk through one real or hypothetical case in detail." },
  { id: "real-world-example", label: "Real-World Example", description: "Ground the idea in a concrete real-world example." },
  { id: "personal-experience", label: "Personal Experience", description: "Explain the idea through your own firsthand experience." },
  { id: "hook-explanation-takeaway", label: "Hook → Explanation → Takeaway", description: "Open with a hook, explain the idea, then end with a takeaway." },
  { id: "hook-story-lesson", label: "Hook → Story → Lesson", description: "Open with a hook, tell a story, then draw out the lesson." },
  { id: "situation-complication-resolution", label: "Situation → Complication → Resolution", description: "Set up the situation, introduce the complication, then resolve it." },
  { id: "context-conflict-conclusion", label: "Context → Conflict → Conclusion", description: "Establish context, introduce the conflict, then conclude." },
  { id: "open-loop-build-close-loop", label: "Open Loop → Build → Close Loop", description: "Open a curiosity gap, build through the explanation, then close the loop." },
].map((o) => ({ ...o, group: "Narrative & Story" }));

const SYSTEMS_AND_STRUCTURE: StructureOption[] = [
  { id: "systems-thinking", label: "Systems Thinking", description: "Explain how the parts interact as an interconnected system, not in isolation." },
  { id: "tree-structure", label: "Tree Structure", description: "Branch from a root idea into sub-branches of increasing detail." },
  { id: "decision-tree", label: "Decision Tree", description: "Walk through a sequence of if/then branching decisions." },
  { id: "concept-map", label: "Concept Map", description: "Explain the idea by describing how concepts connect to each other." },
  { id: "inputs-process-outputs", label: "Inputs → Process → Outputs", description: "Describe the inputs, the process, and the resulting outputs." },
  { id: "feedback-loop", label: "Feedback Loop", description: "Explain the idea as a cycle where outputs feed back into inputs." },
  { id: "classification", label: "Classification (Categories & Types)", description: "Organize the explanation into distinct categories or types." },
  { id: "ranking", label: "Ranking (Best → Worst)", description: "Order the items from best to worst with reasoning." },
  { id: "checklist-format", label: "Checklist Format", description: "Present the explanation as a checklist of items." },
].map((o) => ({ ...o, group: "Systems & Structure" }));

const ABSTRACTION_LEVEL: StructureOption[] = [
  { id: "abstract-to-concrete", label: "Abstract → Concrete", description: "Start with the abstract idea, then ground it in something concrete." },
  { id: "concrete-to-abstract", label: "Concrete → Abstract", description: "Start with a concrete example, then generalize to the abstract idea." },
  { id: "simple-to-complex", label: "Simple → Complex", description: "Start with the simplest version, then add complexity." },
  { id: "complex-to-simple", label: "Complex → Simple", description: "Start with the full complexity, then distill it to something simple." },
  { id: "inside-out", label: "Inside-Out (Core Idea → External Effects)", description: "Start from the core idea, then explain its outward effects." },
  { id: "outside-in", label: "Outside-In (Context → Details → Core Idea)", description: "Start from the surrounding context, then narrow in on the core idea." },
].map((o) => ({ ...o, group: "Abstraction Level" }));

const ANALYTICAL_FRAMEWORKS: StructureOption[] = [
  { id: "observation-insight-action", label: "Observation → Insight → Action", description: "Start from an observation, draw an insight, then recommend an action." },
  { id: "observation-pattern-principle", label: "Observation → Pattern → Principle", description: "Start from an observation, identify the pattern, then state the principle." },
  { id: "fact-interpretation-implication", label: "Fact → Interpretation → Implication", description: "State the fact, interpret it, then explain its implication." },
  { id: "signal-noise", label: "Signal → Noise (Separate Important from Unimportant)", description: "Separate what actually matters from what doesn't." },
  { id: "hypothesis-test-result", label: "Hypothesis → Test → Result", description: "State a hypothesis, how it was tested, and the result." },
  { id: "question-investigation-discovery", label: "Question → Investigation → Discovery", description: "Pose a question, describe the investigation, then the discovery." },
  { id: "decision-framework", label: "Decision Framework (If X, Then Y)", description: "Frame the explanation as a set of if/then decision rules." },
  { id: "principle-example-application", label: "Principle → Example → Application", description: "State the principle, illustrate it with an example, then apply it." },
  { id: "common-mistakes-corrections", label: "Common Mistakes → Corrections", description: "List common mistakes, then the correct approach for each." },
  { id: "analogy-counterexample", label: "Analogy + Counterexample", description: "Use an analogy, then a counterexample to sharpen the point." },
].map((o) => ({ ...o, group: "Analytical Frameworks" }));

const COMMUNICATION_FORMATS: StructureOption[] = [
  { id: "inverted-pyramid", label: "Inverted Pyramid (Journalism)", description: "Lead with the most important information, then add supporting detail." },
  { id: "news-report", label: "News Report (Who, What, When, Where, Why, How)", description: "Cover who, what, when, where, why, and how." },
  { id: "elevator-pitch", label: "Elevator Pitch (30 sec / 60 sec / 2 min)", description: "Compress the idea into a tight, persuasive pitch." },
  { id: "why-how-what", label: "Why → How → What", description: "Start with why it matters, then how it works, then what it is." },
  { id: "what-why-how", label: "What → Why → How", description: "Start with what it is, then why it matters, then how it works." },
  { id: "data-driven", label: "Data-Driven Explanation", description: "Lead with data and evidence to support each point." },
].map((o) => ({ ...o, group: "Communication Formats" }));

export const STRUCTURE_GROUPS: { group: string; options: StructureOption[] }[] = [
  { group: NO_CONSTRAINT.group, options: [NO_CONSTRAINT] },
  { group: "Foundational", options: FOUNDATIONAL },
  { group: "Time & Sequence", options: TIME_AND_SEQUENCE },
  { group: "Cause, Problem & Solution", options: CAUSE_PROBLEM_SOLUTION },
  { group: "Argument & Evidence", options: ARGUMENT_AND_EVIDENCE },
  { group: "Comparison", options: COMPARISON },
  { group: "Teaching & Explaining", options: TEACHING_AND_EXPLAINING },
  { group: "Narrative & Story", options: NARRATIVE_AND_STORY },
  { group: "Systems & Structure", options: SYSTEMS_AND_STRUCTURE },
  { group: "Abstraction Level", options: ABSTRACTION_LEVEL },
  { group: "Analytical Frameworks", options: ANALYTICAL_FRAMEWORKS },
  { group: "Communication Formats", options: COMMUNICATION_FORMATS },
];

export const STRUCTURE_OPTIONS: StructureOption[] = STRUCTURE_GROUPS.flatMap((g) => g.options);

export type StructureId = string;

export function getStructureOption(id: string | null | undefined): StructureOption {
  return STRUCTURE_OPTIONS.find((option) => option.id === id) ?? NO_CONSTRAINT;
}
