import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function SaveProgressPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ email, password });

      if (updateError) {
        setError(updateError.message);
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveProgress.failed);
      setStatus("error");
    }
  };

  if (loading) return null;

  if (user && !user.is_anonymous) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          {t.saveProgress.alreadySaved(user.email ?? "")}
        </p>
        <Link to="/">
          <Button variant="secondary">{t.saveProgress.backToDashboard}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {t.saveProgress.title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.saveProgress.subtitle}</p>
      </div>

      <Card>
        {status === "sent" ? (
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            {t.saveProgress.sent(email)}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder={t.saveProgress.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder={t.saveProgress.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? t.saveProgress.saving : t.saveProgress.submit}
            </Button>
          </form>
        )}
      </Card>

      <Link
        to="/sign-in"
        className="text-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {t.saveProgress.alreadyHaveAccount}
      </Link>
    </div>
  );
}
