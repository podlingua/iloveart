export type FactCheckVerdict = "true" | "false" | "misleading" | "unverifiable";

export interface FactCheckSource {
  title: string;
  url: string;
}

export interface FactCheckClaim {
  claim: string;
  verdict: FactCheckVerdict;
  explanation: string;
  sources: FactCheckSource[];
}

export interface FactCheckResult {
  claims: FactCheckClaim[];
}
