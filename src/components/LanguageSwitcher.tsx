import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLang } from "@/LanguageContext";
import { LANGUAGES } from "@/i18n";
import type { Lang } from "@/types";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 sm:px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-700/80"
      >
        <Globe className="h-4 w-4 text-emerald-400" />
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden xl:inline">{current.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 shadow-2xl shadow-black/40">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code as Lang);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-zinc-700/80 ${
                l.code === lang ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-200"
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === lang && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
