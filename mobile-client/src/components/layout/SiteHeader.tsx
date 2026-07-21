import { Link } from "react-router-dom";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-6">
      <Link to="/" className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
        {t.header.brand}
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
          <button
            onClick={() => setLang("en")}
            className={`rounded-full px-2 py-1 ${
              lang === "en"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("es")}
            className={`rounded-full px-2 py-1 ${
              lang === "es"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            ES
          </button>
        </div>

        {isSupabaseConfigured && !loading && (
          <>
            <Link
              to="/history"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t.header.history}
            </Link>

            {user && !user.is_anonymous && (
              <>
                <span className="text-zinc-400">{user.email}</span>
                <Link
                  to="/account"
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {t.header.account}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {t.header.signOut}
                </button>
              </>
            )}

            {user && user.is_anonymous && (
              <>
                <Link
                  to="/save-progress"
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {t.header.saveProgress}
                </Link>
                <Link
                  to="/sign-in"
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {t.header.signIn}
                </Link>
              </>
            )}
          </>
        )}
      </nav>
    </header>
  );
}
