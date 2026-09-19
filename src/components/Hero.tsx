import { Search, Zap, Shield, Globe2, Clock } from "lucide-react";
import { useLang } from "@/LanguageContext";

export function Hero() {
  const { t } = useLang();

  const stats = [
    { value: "15+", label: t.hero.statsNumbers },
    { value: "6", label: t.hero.statsCountries },
    { value: "8.5K+", label: t.hero.statsMessages },
    { value: "2.1K", label: t.hero.statsOnline },
  ];

  const features = [
    { icon: Zap, text: t.why.items[0].title },
    { icon: Shield, text: t.why.items[1].title },
    { icon: Globe2, text: t.why.items[2].title },
    { icon: Clock, text: t.why.items[4].title },
  ];

  return (
    <section className="relative w-full max-w-full overflow-hidden pt-32 pb-10">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[300px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full bg-emerald-600/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {t.hero.badge}
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t.hero.title}{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-400">
            {t.hero.subtitle}
          </p>

          <div className="mx-auto mt-8 grid max-w-xs grid-cols-2 gap-2.5 sm:max-w-xl sm:grid-cols-4 sm:gap-3 md:max-w-2xl">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-2 text-xs font-medium text-zinc-300 whitespace-nowrap sm:gap-2 sm:px-3.5 md:px-4 md:text-sm"
              >
                <f.icon className="h-3.5 w-3.5 shrink-0 text-emerald-400 md:h-4 md:w-4" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-6 text-center transition-all hover:border-emerald-500/30"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
              <div className="mt-2 text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
