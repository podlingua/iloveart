"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { en, es, Translations } from "@/lib/i18n/translations";

export type Lang = "en" | "es";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
});

const STORAGE_KEY = "speech-coach-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    // One-time hydration of the persisted/browser-detected language after
    // mount, since localStorage/navigator aren't available during SSR.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(stored);
      return;
    }
    if (navigator.language?.toLowerCase().startsWith("es")) {
      setLangState("es");
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: lang === "es" ? es : en }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
