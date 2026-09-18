import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/LanguageContext";

export function FAQ() {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t.faq.title}</h2>
          <p className="mt-4 text-lg text-zinc-400">{t.faq.subtitle}</p>
        </div>

        <div className="mt-12 space-y-3">
          {t.faq.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isOpen ? "border-emerald-500/30 bg-zinc-900/60" : "border-zinc-800 bg-zinc-900/30"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-white">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-all duration-300 ${
                      isOpen ? "rotate-180 text-emerald-400" : "text-zinc-500"
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
