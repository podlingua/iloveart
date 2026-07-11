export type DrillType = "lead_with_point" | "precision" | "structure" | "compression";

export interface AnalysisMetrics {
  time_to_point_seconds: number | null;
  filler_word_count: number;
  repetition_count: number;
  avg_sentence_length: number;
  speaking_pace_wpm: number | null;
  vague_term_count: number;
  restart_count: number;
}

export interface SpeechAnalysis {
  main_point_summary: string;
  structure_detected: string[];
  structure_suggested: string[];
  strongest_skill: string;
  biggest_weakness: string;
  weakness_type: DrillType;
  metrics: AnalysisMetrics;
}

export interface Drill {
  type: DrillType;
  label: string;
  instructions: string;
}

export type ComparisonVerdict = "improved" | "same" | "regressed";

export interface ComparisonResult {
  summary: string;
  dimensions: {
    time_to_point: ComparisonVerdict;
    filler_words: ComparisonVerdict;
    repetition: ComparisonVerdict;
    structure: ComparisonVerdict;
    conciseness: ComparisonVerdict;
    use_of_examples: ComparisonVerdict;
    conclusion_clarity: ComparisonVerdict;
    speaking_pace: ComparisonVerdict;
  };
  metrics_diff: {
    time_to_point_seconds: number | null;
    filler_word_count: number;
    repetition_count: number;
    speaking_pace_wpm: number | null;
  };
}
