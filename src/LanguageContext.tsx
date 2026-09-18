import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Lang } from "./types";
import { translations, getLangFromPath, localizedPath, stripLang } from "./i18n";
import { authTranslations, type AuthDict } from "./i18n-auth";

type LangContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof translations)[Lang];
  ta: AuthDict;
  localizedPath: (path: string) => string;
};

const LangContext = createContext<LangContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLangState] = useState<Lang>(() => getLangFromPath(location.pathname));

  useEffect(() => {
    setLangState(getLangFromPath(location.pathname));
  }, [location.pathname]);

  const setLang = (newLang: Lang) => {
    const stripped = stripLang(location.pathname);
    const newPath = `/${newLang}${stripped === "/" ? "" : stripped}`;
    navigate(newPath);
  };

  const value: LangContextType = {
    lang,
    setLang,
    t: translations[lang],
    ta: authTranslations[lang],
    localizedPath: (path: string) => localizedPath(lang, path),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
