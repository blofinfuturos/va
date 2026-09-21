import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  MessageCircle,
  Mail,
  Facebook,
  Instagram,
  Music,
  Gamepad2,
  Monitor,
  Apple,
  ShoppingBag,
  Play,
  Car,
  Zap,
  ShieldCheck,
  Lock,
  Clock,
  ChevronRight,
  Search,
  Globe2,
  Crown,
  Check,
  Copy,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { useLang } from "@/LanguageContext";
import { useAuth } from "@/AuthContext";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";
import type { VerificationService, PhoneNumber } from "@/types";
import { PhoneCountryFlag, CountryFlag } from "./CountryFlag";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Send,
  MessageCircle,
  Mail,
  Facebook,
  Instagram,
  Music,
  Gamepad2,
  Monitor,
  Apple,
  ShoppingBag,
  Play,
  Car,
  MessageSquare,
};

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || MessageSquare;
  return <Icon className={className} />;
}

type ActivationSectionProps = {
  onBuy: (service: VerificationService) => void;
};

export function ActivationSection({ onBuy }: ActivationSectionProps) {
  const { t } = useLang();
  const [services, setServices] = useState<VerificationService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("verification_services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setServices(data);
      setLoading(false);
    })();
  }, []);

  const tv = t.verify;

  return (
    <section id="activations" className="w-full max-w-full overflow-hidden py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">{tv.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">{tv.subtitle}</p>
            </div>
          </div>

          {/* Feature badges */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
              <Zap className="h-3.5 w-3.5" />
              {tv.instantCode}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {tv.privateAccess}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
              <Lock className="h-3.5 w-3.5" />
              {tv.noRegistration}
            </span>
          </div>
        </div>

        {/* Service grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-800" />
                <div className="mt-3 h-4 w-20 mx-auto rounded bg-zinc-800" />
                <div className="mt-2 h-3 w-12 mx-auto rounded bg-zinc-800/60" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => onBuy(service)}
                className="group relative flex flex-col items-center rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-4 text-center transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 active:scale-[0.97]"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700/50 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${service.color}20` }}
                >
                  <ServiceIcon name={service.icon} className="h-6 w-6" />
                </div>
                <div className="mt-3 text-sm font-bold text-white">{service.name}</div>
                <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-400">
                  <span>{service.price.toFixed(2)}€</span>
                  <span className="text-zinc-500">· {tv.perService}</span>
                </div>
                <div className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-blue-500/10 py-1.5 text-[11px] font-bold text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
                  {tv.buyBtn}
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
            {tv.howItWorks}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-black text-blue-400">
                1
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{tv.step1}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-sm font-black text-emerald-400">
                2
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{tv.step2}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-sm font-black text-amber-400">
                3
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{tv.step3}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
