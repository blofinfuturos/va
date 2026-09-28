import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  Loader2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Globe2,
  Wallet,
  Tag,
  Boxes,
  Clock,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Signal,
} from "lucide-react";
import { useLang } from "@/LanguageContext";

type QueryResult = {
  httpStatus: number;
  ok: boolean;
  data: unknown;
  raw: string;
  queriedCountry?: string;
};

type CatalogResponse = {
  success: boolean;
  error?: string;
  detail?: string;
  queries?: {
    countries?: QueryResult;
    pricing?: QueryResult;
    products?: QueryResult;
    summary?: QueryResult;
    balance?: QueryResult;
  };
};

type DurationOption = {
  price: number;
  delivery: number;
  delivery_samples: number;
  count: number;
  is_voip: boolean;
  refundable: boolean;
  renewable: boolean;
};

type DurationEntry = {
  duration: number;
  price: number;
  is_voip: boolean;
  options: DurationOption[];
  count: number;
  refundable: boolean;
  renewable: boolean;
};

type ServiceEntry = {
  name: string;
  label: string;
  geo_advisory: string | null;
  durations: DurationEntry[];
};

type PricingData = {
  mode: string;
  country: string;
  currency: string;
  services: ServiceEntry[];
};

const COUNTRY_NAMES: Record<string, string> = {
  us: "United States", gb: "United Kingdom", ca: "Canada", au: "Australia",
  de: "Germany", fr: "France", es: "Spain", it: "Italy", nl: "Netherlands",
  ru: "Russia", ua: "Ukraine", pl: "Poland", se: "Sweden", fi: "Finland",
  ro: "Romania", id: "Indonesia", ph: "Philippines", br: "Brazil",
  mx: "Mexico", in: "India", jp: "Japan", kr: "South Korea", za: "South Africa",
  ar: "Argentina", cl: "Chile", co: "Colombia", pe: "Peru", th: "Thailand",
  vn: "Vietnam", tr: "Turkey", eg: "Egypt", ma: "Morocco", ng: "Nigeria",
  ke: "Kenya", pk: "Pakistan", bd: "Bangladesh", pt: "Portugal", gr: "Greece",
  cz: "Czech Republic", hu: "Hungary", be: "Belgium", at: "Austria", ch: "Switzerland",
  dk: "Denmark", no: "Norway", ie: "Ireland", nz: "New Zealand", sg: "Singapore",
  my: "Malaysia", hk: "Hong Kong", tw: "Taiwan", sa: "Saudi Arabia", ae: "UAE",
  il: "Israel", kz: "Kazakhstan", uz: "Uzbekistan", az: "Azerbaijan",
  ge: "Georgia", am: "Armenia", by: "Belarus", lt: "Lithuania", lv: "Latvia",
  ee: "Estonia", sk: "Slovakia", si: "Slovenia", hr: "Croatia", bg: "Bulgaria",
  rs: "Serbia", mk: "North Macedonia", al: "Albania", ba: "Bosnia", me: "Montenegro",
};

const COUNTRY_FLAGS: Record<string, string> = {
  us: "🇺🇸", gb: "🇬🇧", ca: "🇨🇦", au: "🇦🇺", de: "🇩🇪", fr: "🇫🇷",
  es: "🇪🇸", it: "🇮🇹", nl: "🇳🇱", ru: "🇷🇺", ua: "🇺🇦", pl: "🇵🇱",
  se: "🇸🇪", fi: "🇫🇮", ro: "🇷🇴", id: "🇮🇩", ph: "🇵🇭", br: "🇧🇷",
  mx: "🇲🇽", in: "🇮🇳", jp: "🇯🇵", kr: "🇰🇷", za: "🇿🇦", ar: "🇦🇷",
  cl: "🇨🇱", co: "🇨🇴", pe: "🇵🇪", th: "🇹🇭", vn: "🇻🇳", tr: "🇹🇷",
  eg: "🇪🇬", ma: "🇲🇦", ng: "🇳🇬", ke: "🇰🇪", pk: "🇵🇰", bd: "🇧🇩",
  pt: "🇵🇹", gr: "🇬🇷", cz: "🇨🇿", hu: "🇭🇺", be: "🇧🇪", at: "🇦🇹",
  ch: "🇨🇭", dk: "🇩🇰", no: "🇳🇴", ie: "🇮🇪", nz: "🇳🇿", sg: "🇸🇬",
  my: "🇲🇾", hk: "🇭🇰", tw: "🇹🇼", sa: "🇸🇦", ae: "🇦🇪", il: "🇮🇱",
};

function formatDuration(minutes: number): string {
  if (minutes >= 43200) return "30 days";
  if (minutes >= 20160) return "14 days";
  if (minutes >= 10080) return "7 days";
  if (minutes >= 4320) return "3 days";
  if (minutes >= 1440) return "1 day";
  if (minutes >= 240) return "4 hours";
  if (minutes >= 60) return "1 hour";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code.toUpperCase();
}

function getCountryFlag(code: string): string {
  return COUNTRY_FLAGS[code] || "🏳️";
}

export function EvesesCatalogTestPage() {
  const { localizedPath } = useLang();
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [countriesResult, setCountriesResult] = useState<CatalogResponse | null>(null);
  const [pricingResult, setPricingResult] = useState<CatalogResponse | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({});

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const fetchCountries = useCallback(async () => {
    setLoadingCountries(true);
    setCountriesResult(null);
    try {
      const url = `${supabaseUrl}/functions/v1/eveses-catalog?action=countries`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      setCountriesResult(json as CatalogResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setCountriesResult({ success: false, error: "Failed to fetch countries.", detail: message });
    } finally {
      setLoadingCountries(false);
    }
  }, [supabaseUrl, supabaseKey]);

  const fetchPricing = useCallback(async (country: string) => {
    setLoadingPricing(true);
    setPricingResult(null);
    try {
      const url = `${supabaseUrl}/functions/v1/eveses-catalog?action=pricing&country=${country}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      setPricingResult(json as CatalogResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setPricingResult({ success: false, error: "Failed to fetch pricing.", detail: message });
    } finally {
      setLoadingPricing(false);
    }
  }, [supabaseUrl, supabaseKey]);

  const toggleRaw = (key: string) => setShowRaw((p) => ({ ...p, [key]: !p[key] }));

  // Parse countries list
  const countriesList = useMemo<string[]>(() => {
    if (!countriesResult?.queries?.countries?.data) return [];
    const d = countriesResult.queries.countries.data;
    if (typeof d === "object" && d !== null && !Array.isArray(d)) {
      const obj = d as Record<string, unknown>;
      if (Array.isArray(obj.countries)) return obj.countries as string[];
    }
    return [];
  }, [countriesResult]);

  // Parse pricing data for anyother service
  const pricingData = useMemo<PricingData | null>(() => {
    if (!pricingResult?.queries?.pricing?.data) return null;
    const d = pricingResult.queries.pricing.data;
    if (typeof d === "object" && d !== null && !Array.isArray(d)) {
      return d as PricingData;
    }
    return null;
  }, [pricingResult]);

  const anyotherService = useMemo<ServiceEntry | null>(() => {
    if (!pricingData?.services) return null;
    const found = pricingData.services.find((s) => s.name === "anyother");
    return found || null;
  }, [pricingData]);

  const renderQueryCard = (
    key: string,
    label: string,
    icon: typeof Globe2,
    query?: QueryResult
  ) => {
    const Icon = icon;
    if (!query) return null;

    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                query.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">{label}</span>
              <span
                className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  query.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                }`}
              >
                HTTP {query.httpStatus}
              </span>
              {query.queriedCountry && (
                <span className="ml-1.5 text-[10px] text-zinc-500">country={query.queriedCountry}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => toggleRaw(key)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {showRaw[key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showRaw[key] ? "Ocultar" : "Ver JSON"}
          </button>
        </div>

        <div className="p-4">
          {query.ok && query.data && (
            <div className="text-xs text-zinc-400 mb-2">
              {Array.isArray(query.data) ? (
                <span>{(query.data as unknown[]).length} elementos</span>
              ) : typeof query.data === "object" && query.data !== null ? (
                <span>{Object.keys(query.data as object).length} claves</span>
              ) : typeof query.data === "string" ? (
                <span className="font-mono text-zinc-300">{(query.data as string).substring(0, 200)}</span>
              ) : (
                <span>{String(query.data)}</span>
              )}
            </div>
          )}

          {showRaw[key] && (
            <pre className="mt-2 max-h-96 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap break-all">
              {JSON.stringify(query.data, null, 2)}
            </pre>
          )}

          {!query.ok && (
            <div className="mt-1 text-xs text-red-300 font-mono break-all">{query.raw}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-hidden pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          to={localizedPath("/")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <Boxes className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Catálogo Eveses — Private Number · Any Service
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
            Consulta precios y disponibilidad reales de números privados en alquiler
            (mode=rent, service=anyother). Sin comprar ni reservar.
          </p>
        </div>

        {/* Step 1: Load countries */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <button
            onClick={fetchCountries}
            disabled={loadingCountries}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-7 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/10 transition-all hover:from-amber-400 hover:to-yellow-400 disabled:opacity-60 active:scale-[0.98]"
          >
            {loadingCountries ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando países...
              </>
            ) : (
              <>
                <Globe2 className="h-5 w-5" />
                {countriesList.length > 0 ? "Recargar países" : "Cargar países disponibles"}
              </>
            )}
          </button>
        </div>

        {/* Countries result */}
        {countriesResult && !countriesResult.success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-400">Error</h3>
              <p className="mt-0.5 text-sm text-zinc-300">{countriesResult.error}</p>
            </div>
          </div>
        )}

        {countriesResult?.queries?.countries && (
          <div className="mb-6 space-y-4">
            {renderQueryCard("countries", "Países (mode=rent)", Globe2, countriesResult.queries.countries)}
          </div>
        )}

        {/* Step 2: Country selector */}
        {countriesList.length > 0 && (
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Selecciona un país
            </label>
            <div className="flex flex-wrap gap-2">
              {countriesList.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCountry(c);
                    fetchPricing(c);
                  }}
                  disabled={loadingPricing}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-all disabled:opacity-50 ${
                    selectedCountry === c
                      ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40"
                  }`}
                >
                  <span className="text-base">{getCountryFlag(c)}</span>
                  <span>{getCountryName(c)}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{c}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Pricing results */}
        {loadingPricing && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            <span className="ml-2 text-sm text-zinc-400">Consultando precios para {selectedCountry}...</span>
          </div>
        )}

        {pricingResult && !pricingResult.success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-400">Error</h3>
              <p className="mt-0.5 text-sm text-zinc-300">{pricingResult.error}</p>
            </div>
          </div>
        )}

        {pricingResult?.queries?.pricing && (
          <div className="space-y-4">
            {/* Raw pricing API response */}
            {renderQueryCard("pricing", `Pricing API (mode=rent, service=anyother, country=${selectedCountry})`, Server, pricingResult.queries.pricing)}

            {/* Parsed catalog */}
            {anyotherService ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-zinc-800/60 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">
                      {getCountryFlag(selectedCountry)} {getCountryName(selectedCountry)}
                    </span>
                    <span className="ml-2 text-xs text-zinc-500">
                      {anyotherService.label} · {anyotherService.durations.length} duraciones
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-800/40">
                  {anyotherService.durations.map((dur) => (
                    <div key={dur.duration} className="px-4 py-4">
                      {/* Duration header */}
                      <div className="mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-bold text-white">
                          {formatDuration(dur.duration)}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">({dur.duration} min)</span>
                        <span className="ml-auto text-xs text-zinc-400">
                          Stock total: <span className="font-mono font-semibold text-emerald-400">{dur.count}</span>
                        </span>
                      </div>

                      {/* Options table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-zinc-800/60 text-left text-zinc-500">
                              <th className="py-1.5 pr-3 font-medium">Precio</th>
                              <th className="py-1.5 pr-3 font-medium">Stock</th>
                              <th className="py-1.5 pr-3 font-medium">Delivery</th>
                              <th className="py-1.5 pr-3 font-medium">Renovable</th>
                              <th className="py-1.5 pr-3 font-medium">Refundable</th>
                              <th className="py-1.5 font-medium">VoIP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dur.options.map((opt, i) => (
                              <tr key={i} className="border-b border-zinc-800/20 last:border-0">
                                <td className="py-2 pr-3 font-mono font-bold text-amber-400">
                                  ${(opt.price / 100).toFixed(2)}
                                  <span className="ml-1 text-[9px] text-zinc-500">{pricingData?.currency || "USD"}</span>
                                </td>
                                <td className="py-2 pr-3 font-mono text-emerald-400 font-semibold">
                                  {opt.count}
                                </td>
                                <td className="py-2 pr-3 font-mono text-zinc-300">
                                  {(opt.delivery * 100).toFixed(0)}%
                                  {opt.delivery_samples > 0 && (
                                    <span className="ml-1 text-[9px] text-zinc-500">({opt.delivery_samples} samples)</span>
                                  )}
                                </td>
                                <td className="py-2 pr-3">
                                  {opt.renewable ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-400">
                                      <RotateCcw className="h-3 w-3" />
                                      <span className="text-[10px]">Sí</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-zinc-500">No</span>
                                  )}
                                </td>
                                <td className="py-2 pr-3">
                                  {opt.refundable ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-400">
                                      <ShieldCheck className="h-3 w-3" />
                                      <span className="text-[10px]">Sí</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-zinc-500">No</span>
                                  )}
                                </td>
                                <td className="py-2">
                                  {opt.is_voip ? (
                                    <span className="inline-flex items-center gap-1 text-zinc-400">
                                      <Signal className="h-3 w-3" />
                                      <span className="text-[10px]">VoIP</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400">Real SIM</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              pricingData && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-400">
                        service=anyother no disponible para {getCountryName(selectedCountry)}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        La API devolvió {pricingData.services.length} servicios, pero ninguno es
                        "anyother". Revisa el JSON crudo arriba para ver qué servicios están
                        disponibles para este país.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {pricingData.services.slice(0, 15).map((s) => (
                          <span key={s.name} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                            {s.name}
                          </span>
                        ))}
                        {pricingData.services.length > 15 && (
                          <span className="text-[10px] text-zinc-500">
                            +{pricingData.services.length - 15} más...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* API reference */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="text-sm font-bold text-white mb-3">Endpoint usado</h3>
              <div className="flex items-start gap-2 text-xs">
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400 text-[10px]">GET</code>
                <code className="text-zinc-300 break-all">
                  /api/v1/numbers/pricing?mode=rent&country={selectedCountry || "{iso2}"}&service=anyother
                </code>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-500">
                <p>Auth: Bearer token (servidor). La compra usará POST /api/v1/numbers/orders con mode=rent, service=anyother, country y duration_minutes.</p>
              </div>
            </div>
          </div>
        )}

        {/* Initial empty state */}
        {!countriesResult && !loadingCountries && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <Globe2 className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-400">
              Pulsa "Cargar países disponibles" para empezar.
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Primero se obtienen los países con mode=rent, luego se consulta el pricing de cada país individualmente.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            Página de diagnóstico. La API Key nunca se muestra ni se envía al navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
