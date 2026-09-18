import { useState, useMemo } from "react";
import { Search, Copy, Check, Crown, Gift, Globe2, MessageSquare, Clock, ChevronRight, ShoppingCart } from "lucide-react";
import { useLang } from "@/LanguageContext";
import { useAuth } from "@/AuthContext";
import { useNavigate } from "react-router-dom";
import type { PhoneNumber } from "@/types";
import { timeAgo } from "@/utils";
import { PhoneCountryFlag, CountryFlag } from "./CountryFlag";

type NumberCardProps = {
  phone: PhoneNumber;
  onViewSms: (phone: PhoneNumber) => void;
  lang: string;
};

function NumberCard({ phone, onViewSms, lang }: NumberCardProps) {
  const { t, ta, localizedPath } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPaid = phone.type === "paid";

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate(localizedPath("/login"));
    } else {
      navigate(localizedPath("/dashboard"));
    }
  };
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div
      onClick={() => onViewSms(phone)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
    >
      {isPaid && (
        <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
          <Crown className="h-3 w-3" />
          {t.numbers.premium}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 p-1.5">
            <PhoneCountryFlag phone={phone} className="h-7 w-5" />
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-white">{phone.number}</div>
            <div className="mt-0.5 text-sm text-zinc-400">{phone.country_name}</div>
          </div>
        </div>
        {!isPaid && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t.numbers.active}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-zinc-500" />
          <span className="font-semibold text-zinc-300">{phone.received_count.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-zinc-500" />
          <span>{timeAgo(phone.last_sms_at, lang)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-700/60"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              {t.numbers.copied}
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              {t.numbers.copies}
            </>
          )}
        </button>
        {isPaid ? (
          <button
            onClick={handleBuyClick}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2 text-xs font-semibold text-black transition-all hover:from-amber-400 hover:to-yellow-400"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {ta.purchase.buyNow}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewSms(phone);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:from-emerald-400 hover:to-teal-500"
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
};

export function NumberList({ numbers, type, loading, onViewSms }: NumberListProps) {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");

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
      const matchesSearch = !query ||
        phone.country_name.toLowerCase().includes(query) ||
        phone.country_code.toLowerCase().includes(query) ||
        phone.number.toLowerCase().includes(query);
      return matchesCountry && matchesSearch;
    });
  }, [numbers, search, selectedCountry]);

  const title = type === "free" ? t.numbers.freeTitle : t.numbers.paidTitle;
  const subtitle = type === "free" ? t.numbers.freeSubtitle : t.numbers.paidSubtitle;

  return (
    <section className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          <div className="mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-thin">
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
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-300"
            >
              {type === "free" ? <Gift className="h-4 w-4 text-emerald-400" /> : <Crown className="h-4 w-4 text-amber-400" />}
              {type === "free" ? t.nav.freeNumbers : t.nav.paidNumbers}
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
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
            {filtered.map((phone) => (
              <NumberCard
                key={phone.id}
                phone={phone}
                onViewSms={onViewSms}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
