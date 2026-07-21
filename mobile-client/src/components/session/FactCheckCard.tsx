
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FactCheckResult, FactCheckVerdict } from "@/lib/types/factCheck";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const VERDICT_STYLES: Record<FactCheckVerdict, string> = {
  true: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  false: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  misleading: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  unverifiable: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

interface FactCheckCardProps {
  status: "checking" | "done" | "error";
  result: FactCheckResult | null;
  onRetry: () => void;
}

export function FactCheckCard({ status, result, onRetry }: FactCheckCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="flex flex-col gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {t.factCheck.heading}
      </span>

      {status === "checking" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.factCheck.checking}</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-red-600 dark:text-red-400">{t.factCheck.failed}</p>
          <Button variant="secondary" onClick={onRetry}>
            {t.factCheck.retry}
          </Button>
        </div>
      )}

      {status === "done" && result && result.claims.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.factCheck.noClaims}</p>
      )}

      {status === "done" && result && result.claims.length > 0 && (
        <div className="flex flex-col gap-4">
          {result.claims.map((claim, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{claim.claim}</p>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${VERDICT_STYLES[claim.verdict]}`}
                >
                  {t.factCheck.verdicts[claim.verdict]}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{claim.explanation}</p>
              {claim.sources.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
                  <span>{t.factCheck.sources}:</span>
                  {claim.sources.map((source, sourceIndex) => (
                    <a
                      key={sourceIndex}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-400">{t.factCheck.disclaimer}</p>
    </Card>
  );
}
