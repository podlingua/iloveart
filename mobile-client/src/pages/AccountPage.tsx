import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { deleteAccount } from "@/lib/api/client";

const CONFIRM_VALUE = "DELETE";

export default function AccountPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, session, loading } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.account.needsSupabase}</p>
      </div>
    );
  }

  if (loading) return null;

  const handleDelete = async () => {
    if (!session?.access_token) return;
    setStatus("deleting");
    setError(null);
    try {
      await deleteAccount(session.access_token);
      const supabase = createClient();
      await supabase.auth.signOut();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.deleteFailed);
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {t.account.title}
      </h1>

      <Card className="flex flex-col gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {user && !user.is_anonymous
            ? t.account.signedInAs(user.email ?? "")
            : t.account.anonymousNotice}
        </p>
      </Card>

      <Card className="flex flex-col gap-4 border-red-200 dark:border-red-900">
        <span className="text-xs font-medium uppercase tracking-wide text-red-500">
          {t.account.dangerZone}
        </span>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.account.deleteExplainer}</p>

        <label className="flex flex-col gap-1 text-left text-sm text-zinc-600 dark:text-zinc-400">
          {t.account.confirmLabel}
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button
          variant="secondary"
          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          disabled={confirmText !== CONFIRM_VALUE || status === "deleting"}
          onClick={handleDelete}
        >
          {status === "deleting" ? t.account.deleting : t.account.deleteButton}
        </Button>
      </Card>
    </div>
  );
}
