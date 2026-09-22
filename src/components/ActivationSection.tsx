import { useState, useEffect, useMemo } from "react";
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
  ChevronRight,
  Search,
  Globe2,
  Check,
} from "lucide-react";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";
import type { VerificationService } from "@/types";
import { PhoneCountryFlag } from "./CountryFlag";

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

type Country = {
  country_code: string;
  country_name: string;
  country_flag: string;
  min_price: number;
};

type ActivationSectionProps = {
  onBuy: (service: VerificationService, countryCode?: string, countryPrice?: number) => void;
};

export function ActivationSection({ onBuy }: ActivationSectionProps) {
  const { t } = useLang();
  const [services, setServices] = useState<VerificationService[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countryPrices, setCountryPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [svcRes, ctryRes] = await Promise.all([
        supabase
          .from("verification_services")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase.rpc("get_verification_countries"),
      ]);
      if (svcRes.data) setServices(svcRes.data);
      if (ctryRes.data) setCountries(ctryRes.data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setCountryPrices({});
      return;
    }
    (async () => {
      const { data } = await supabase.rpc("get_verification_services_by_country", {
        p_country_code: selectedCountry,
      });
      if (data) {
        const map: Record<string, number> = {};
        for (const row of data) {
          map[row.id] = Number(row.price);
        }
        setCountryPrices(map);
      }
    })();
  }, [selectedCountry]);

  const tv = t.verify;

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.country_name.toLowerCase().includes(q) ||
        c.country_code.toLowerCase().includes(q)
    );
  }, [countries, search]);

  const selectedCountryData = countries.find((c) => c.country_code === selectedCountry);

  const getPrice = (service: VerificationService) => {
    return countryPrices[service.id] ?? service.price;
  };

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

        {/* Country selector */}
        <div className="mb-6">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <Globe2 className="h-4 w-4 text-blue-400" />
            {tv.selectCountry}
          </label>
          <div className="relative max-w-sm">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white hover:border-zinc-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                {selectedCountryData ? (
                  <>
                    <PhoneCountryFlag
                      countryCode={selectedCountryData.country_code}
                      flag={selectedCountryData.country_flag}
                      className="text-lg"
                    />
                    <span>{selectedCountryData.country_name}</span>
                  </>
                ) : (
                  <>
                    <Globe2 className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-500">{tv.allCountries}</span>
                  </>
                )}
              </span>
              <ChevronRight
                className={`h-4 w-4 text-zinc-500 transition-transform ${dropdownOpen ? "rotate-90" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                  {/* Search */}
                  <div className="border-b border-zinc-800 p-2">
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-800/60 px-2.5 py-1.5">
                      <Search className="h-3.5 w-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={tv.searchCountry}
                        className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  {/* All countries option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCountry("");
                      setDropdownOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      !selectedCountry
                        ? "bg-blue-500/15 text-blue-300"
                        : "text-zinc-300 hover:bg-zinc-800/60"
                    }`}
                  >
                    <Globe2 className="h-4 w-4" />
                    <span>{tv.allCountries}</span>
                    {!selectedCountry && <Check className="ml-auto h-4 w-4" />}
                  </button>
                  {/* Country list */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.country_code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c.country_code);
                          setDropdownOpen(false);
                          setSearch("");
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                          selectedCountry === c.country_code
                            ? "bg-blue-500/15 text-blue-300"
                            : "text-zinc-300 hover:bg-zinc-800/60"
                        }`}
                      >
                        <PhoneCountryFlag
                          countryCode={c.country_code}
                          flag={c.country_flag}
                          className="text-lg"
                        />
                        <span>{c.country_name}</span>
                        <span className="ml-auto text-xs text-zinc-500">
                          {c.min_price.toFixed(2)}€
                        </span>
                        {selectedCountry === c.country_code && (
                          <Check className="h-4 w-4 text-blue-400" />
                        )}
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-zinc-500">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
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
                onClick={() =>
                  onBuy(
                    service,
                    selectedCountry || undefined,
                    countryPrices[service.id]
                  )
                }
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
                  <span>{getPrice(service).toFixed(2)}€</span>
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
