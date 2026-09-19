import { useState, useMemo } from "react";
import {
  Search,
  Crown,
  Globe2,
  MessageSquare,
  Clock,
  ChevronRight,
  ShoppingCart,
  Sparkles,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { useLang } from "@/LanguageContext";
import { useAuth } from "@/AuthContext";
import { useNavigate } from "react-router-dom";
import { RENTAL_PLANS, type PhoneNumber } from "@/types";
import { timeAgo } from "@/utils";
import { PhoneCountryFlag, CountryFlag } from "./CountryFlag";
import { CoinPaymentsModal } from "./CoinPaymentsModal";

type NumberCardProps = {
  phone: PhoneNumber;
  onViewSms: (phone: PhoneNumber) => void;
  onBuy: (phone: PhoneNumber, planIndex: number) => void;
  lang: string;
};

function NumberCard({ phone, onViewSms, onBuy, lang }: NumberCardProps) {
  const { t, ta } = useLang();
  const isPaid = phone.type === "paid";
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  const handleCardClick = () => {
    if (isPaid) {
      onBuy(phone, selectedPlanIndex);
    } else {
      onViewSms(phone);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
    >
      {/* Top tag */}
      {isPaid && (
        <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950 shadow-md">
          <Crown className="h-3 w-3" />
          {t.numbers.premium}
        </div>
      )}

      <div>
        {/* Header: Flag & Number */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 p-1.5 shadow-inner">
              <PhoneCountryFlag phone={phone} className="h-7 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-mono text-lg font-bold text-white tracking-tight">{phone.number}</div>
              <div className="truncate mt-0.5 text-xs text-zinc-400 font-medium">{phone.country_name}</div>
            </div>
          </div>
        </div>

        {/* Number stats: ONLY for free numbers. Premium numbers are brand new, clean & private */}
        {isPaid ? (
          <div className="mt-3.5 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>{ta.coinpayments.newAndPrivate}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-semibold text-zinc-300">{phone.received_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span>{timeAgo(phone.last_sms_at, lang)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions & Prices */}
      <div className="mt-4 pt-1">
        {isPaid ? (
          <div className="space-y-2.5">
            {/* Prices displayed above "Comprar ahora" */}
            <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-2">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 px-0.5 mb-1.5 font-medium">
                <span>{ta.coinpayments.rentalPrices}</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  CoinPayments / Cripto
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-center">
                {RENTAL_PLANS.map((plan, idx) => {
                  const isSelected = selectedPlanIndex === idx;
                  const planLabel =
                    plan.id === "24h"
                      ? ta.coinpayments.plan24h
                      : plan.id === "7d"
                      ? ta.coinpayments.plan7d
                      : ta.coinpayments.plan30d;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanIndex(idx);
                      }}
                      className={`rounded-lg border px-1 py-1 transition-all ${
                        isSelected
                          ? "border-amber-500/80 bg-amber-500/15 shadow-sm shadow-amber-500/10"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                      }`}
                    >
                      <div className={`text-[9px] uppercase font-bold tracking-tight ${isSelected ? "text-amber-300" : "text-zinc-400"}`}>
                        {planLabel}
                      </div>
                      <div className="text-xs font-black text-white mt-0.5">
                        {plan.priceEur.toFixed(2)} €
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "Comprar ahora" button that opens CoinPayments option */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBuy(phone, selectedPlanIndex);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-3 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/10 transition-all hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98]"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{ta.purchase.buyNow} ({RENTAL_PLANS[selectedPlanIndex]?.priceEur.toFixed(2)} €)</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewSms(phone);
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:from-emerald-400 hover:to-teal-500"
          >
            {t.numbers.viewSms}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}

type NumberListProps = {
  numbers: PhoneNumber[];
  type: "free" | "paid";
  loading: boolean;
  onViewSms: (phone: PhoneNumber) => void;
  onBuyNow?: (phone: PhoneNumber, planIndex: number) => void;
};

export function NumberList({ numbers, type, loading, onViewSms, onBuyNow }: NumberListProps) {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");

  // CoinPayments checkout modal state
  const [coinPaymentsPhone, setCoinPaymentsPhone] = useState<PhoneNumber | null>(null);
  const [coinPaymentsPlanIndex, setCoinPaymentsPlanIndex] = useState(0);

  const countries = useMemo(() => {
    const unique = new Map<string, PhoneNumber>();
    numbers.forEach((phone) => {
      if (!unique.has(phone.country_code)) unique.set(phone.country_code, phone);
    });
    return Array.from(unique.values()).sort((a, b) => a.country_name.localeCompare(b.country_name));
  }, [numbers]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return numbers.filter((phone) => {
      const matchesCountry = selectedCountry === "all" || phone.country_code === selectedCountry;
      const matchesSearch =
        !query ||
        phone.country_name.toLowerCase().includes(query) ||
        phone.country_code.toLowerCase().includes(query) ||
        phone.number.toLowerCase().includes(query);
      return matchesCountry && matchesSearch;
    });
  }, [numbers, search, selectedCountry]);

  const handleOpenBuy = (phone: PhoneNumber, planIndex: number) => {
    if (onBuyNow) {
      onBuyNow(phone, planIndex);
    } else {
      setCoinPaymentsPhone(phone);
      setCoinPaymentsPlanIndex(planIndex);
    }
  };

  const title = type === "free" ? t.numbers.freeTitle : t.numbers.paidTitle;
  const subtitle = type === "free" ? t.numbers.freeSubtitle : t.numbers.paidSubtitle;

  return (
    <section className="w-full max-w-full overflow-hidden py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                {type === "free" ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Crown className="h-5 w-5 text-amber-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.numbers.searchCountry}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="mt-6 flex w-full max-w-full gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCountry("all")}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                selectedCountry === "all"
                  ? "border-emerald-400 bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20"
                  : "border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-zinc-500 hover:text-white"
              }`}
            >
              <Globe2 className="h-4 w-4" />
              {t.numbers.filterAll}
            </button>
            {countries.map((country) => (
              <button
                key={country.country_code}
                type="button"
                onClick={() => setSelectedCountry(country.country_code)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                  selectedCountry === country.country_code
                    ? "border-emerald-400 bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20"
                    : "border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-zinc-500 hover:text-white"
                }`}
              >
                <CountryFlag
                  countryCode={country.country_code}
                  countryName={country.country_name}
                  className="h-4 w-5"
                />
                {country.country_name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-zinc-800" />
                  <div className="flex-1">
                    <div className="h-5 w-32 rounded bg-zinc-800" />
                    <div className="mt-2 h-4 w-20 rounded bg-zinc-800/60" />
                  </div>
                </div>
                <div className="mt-4 h-4 w-40 rounded bg-zinc-800/40" />
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-24 rounded-lg bg-zinc-800" />
                  <div className="h-8 flex-1 rounded-lg bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-zinc-600" />
            <p className="mt-4 text-zinc-400">{t.numbers.noNumbers}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((phone) => (
              <NumberCard
                key={phone.id}
                phone={phone}
                onViewSms={onViewSms}
                onBuy={handleOpenBuy}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>

      {/* CoinPayments Checkout Modal */}
      <CoinPaymentsModal
        phone={coinPaymentsPhone}
        initialPlanIndex={coinPaymentsPlanIndex}
        isOpen={!!coinPaymentsPhone}
        onClose={() => setCoinPaymentsPhone(null)}
      />
    </section>
  );
}
