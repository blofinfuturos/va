import { Zap, Shield, Globe2, Lock, Clock, Check } from "lucide-react";
import { useLang } from "@/LanguageContext";

const iconMap: Record<string, typeof Zap> = {
  zap: Zap,
  shield: Shield,
  globe: Globe2,
  lock: Lock,
  clock: Clock,
  check: Check,
};

export function WhyChooseUs() {
  const { t } = useLang();

  return (
    <section id="why" className="relative scroll-mt-20 py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t.why.title}</h2>
          <p className="mt-4 text-lg text-zinc-400">{t.why.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.why.items.map((item, i) => {
            const Icon = iconMap[item.icon] || Zap;
            return (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/20 p-7 transition-all duration-300 hover:border-emerald-500/30"
              >
                <div className="absolute right-0 top-0 -z-10 h-32 w-32 translate-y-[-50%] translate-x-[30%] rounded-full bg-emerald-500/5 blur-[40px] transition-opacity group-hover:bg-emerald-500/10" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
