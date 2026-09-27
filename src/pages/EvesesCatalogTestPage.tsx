import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  Loader2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Search,
  Globe2,
  Wallet,
  Tag,
  Boxes,
  Clock,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useLang } from "@/LanguageContext";

type QueryResult = {
  httpStatus: number;
  ok: boolean;
  data: unknown;
  raw: string;
  queriedCountry?: string;
  queriedCountries?: string[];
  totalCountries?: number;
};

type CatalogResponse = {
  success: boolean;
  error?: string;
  detail?: string;
  queries?: {
    countries?: QueryResult;
    products?: QueryResult;
    pricing?: QueryResult;
    summary?: QueryResult;
    balance?: QueryResult;
  };
};

type DurationOption = {
  price: number;
  delivery: number;
  count: number;
  is_voip: boolean;
};

type DurationEntry = {
  duration: number;
  price: number;
  is_voip: boolean;
  options: DurationOption[];
  count: number;
};

type ServiceEntry = {
  name: string;
  durations: DurationEntry[];
};

type PricingData = {
  mode: string;
  country: string;
  currency: string;
  services: ServiceEntry[];
};

type RentalRow = {
  country: string;
  countryName: string;
  service: string;
  durationLabel: string;
  durationMinutes: number;
  price: number;
  currency: string;
  stock: number;
  deliveryRate: number;
  isVoip: boolean;
  renewable: boolean;
  refundable: boolean;
};

const COUNTRY_NAMES: Record<string, string> = {
  us: "United States",
  gb: "United Kingdom",
  ca: "Canada",
  au: "Australia",
  de: "Germany",
  fr: "France",
  es: "Spain",
  it: "Italy",
  nl: "Netherlands",
  ru: "Russia",
  ua: "Ukraine",
  pl: "Poland",
  se: "Sweden",
  fi: "Finland",
  ro: "Romania",
  id: "Indonesia",
  ph: "Philippines",
  br: "Brazil",
  mx: "Mexico",
  in: "India",
  jp: "Japan",
  kr: "South Korea",
  za: "South Africa",
  ar: "Argentina",
  cl: "Chile",
  co: "Colombia",
  pe: "Peru",
  th: "Thailand",
  vn: "Vietnam",
  tr: "Turkey",
  eg: "Egypt",
  ma: "Morocco",
  ng: "Nigeria",
  ke: "Kenya",
  pk: "Pakistan",
  bd: "Bangladesh",
};

const COUNTRY_FLAGS: Record<string, string> = {
  us: "🇺🇸", gb: "🇬🇧", ca: "🇨🇦", au: "🇦🇺", de: "🇩🇪", fr: "🇫🇷",
  es: "🇪🇸", it: "🇮🇹", nl: "🇳🇱", ru: "🇷🇺", ua: "🇺🇦", pl: "🇵🇱",
  se: "🇸🇪", fi: "🇫🇮", ro: "🇷🇴", id: "🇮🇩", ph: "🇵🇭", br: "🇧🇷",
  mx: "🇲🇽", in: "🇮🇳", jp: "🇯🇵", kr: "🇰🇷", za: "🇿🇦", ar: "🇦🇷",
  cl: "🇨🇱", co: "🇨🇴", pe: "🇵🇪", th: "🇹🇭", vn: "🇻🇳", tr: "🇹🇷",
  eg: "🇪🇬", ma: "🇲🇦", ng: "🇳🇬", ke: "🇰🇪", pk: "🇵🇰", bd: "🇧🇩",
};

function formatDuration(minutes: number): string {
  if (minutes >= 43200) return "30 days";
  if (minutes >= 20160) return "14 days";
  if (minutes >= 10080) return "7 days";
  if (minutes >= 1440) return "24 hours";
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CatalogResponse | null>(null);
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const runQuery = async (action: string = "rental-catalog") => {
    setLoading(true);
    setResult(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/eveses-catalog?action=${action}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      setResult(json as CatalogResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setResult({
        success: false,
        error: "Failed to call the Edge Function.",
        detail: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRaw = (key: string) => {
    setShowRaw((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Parse pricing data into rental rows
  const rentalRows = useMemo<RentalRow[]>(() => {
    if (!result?.queries?.pricing?.data) return [];
    const pricing = result.queries.pricing.data;
    const rows: RentalRow[] = [];

    // If pricing is from multiple countries, it's an object keyed by country code
    if (typeof pricing === "object" && pricing !== null && !Array.isArray(pricing)) {
      const pricingObj = pricing as Record<string, unknown>;

      // Check if it's a multi-country response (object of country -> pricing data)
      // or a single-country response (has "services" array)
      if (Array.isArray(pricingObj.services)) {
        // Single country response
        const country = (pricingObj.country as string) || result.queries.pricing.queriedCountry || "";
        rows.push(...parsePricingForCountry(country, pricingObj as unknown as PricingData));
      } else {
        // Multi-country response
        for (const [countryCode, countryData] of Object.entries(pricingObj)) {
          if (typeof countryData === "object" && countryData !== null && !Array.isArray(countryData)) {
            const d = countryData as Record<string, unknown>;
            if (Array.isArray(d.services)) {
              rows.push(...parsePricingForCountry(countryCode, d as unknown as PricingData));
            } else if (d.error) {
              // Skip countries with errors
            }
          }
        }
      }
    }

    return rows;
  }, [result]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rentalRows;
    const q = searchTerm.toLowerCase();
    return rentalRows.filter(
      (r) =>
        r.country.toLowerCase().includes(q) ||
        r.countryName.toLowerCase().includes(q) ||
        r.durationLabel.toLowerCase().includes(q)
    );
  }, [rentalRows, searchTerm]);

  // Group rows by country for card display
  const groupedByCountry = useMemo(() => {
    const map = new Map<string, RentalRow[]>();
    for (const row of filteredRows) {
      const existing = map.get(row.country) || [];
      existing.push(row);
      map.set(row.country, existing);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredRows]);

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
              {query.totalCountries != null && (
                <span className="ml-1.5 text-[10px] text-zinc-500">{query.totalCountries} countries</span>
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
            <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap break-all">
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

        <div className="mb-6 flex flex-col items-center gap-3">
          <button
            onClick={() => runQuery("rental-catalog")}
            disabled={loading}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-7 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/10 transition-all hover:from-amber-400 hover:to-yellow-400 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Consultando catálogo de alquiler...
              </>
            ) : (
              <>
                <Server className="h-5 w-5" />
                Consultar catálogo completo
              </>
            )}
          </button>
        </div>

        {result && !result.success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-400">Error</h3>
              <p className="mt-0.5 text-sm text-zinc-300">{result.error}</p>
              {result.detail && (
                <p className="mt-1 text-xs text-zinc-500 font-mono">{result.detail}</p>
              )}
            </div>
          </div>
        )}

        {result?.queries && (
          <div className="space-y-4">
            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renderQueryCard("countries", "Países (mode=rent)", Globe2, result.queries.countries)}
              {renderQueryCard("products", "Productos (mode=rent)", Tag, result.queries.products)}
              {renderQueryCard("balance", "Wallet", Wallet, result.queries.balance)}
            </div>

            {/* Summary card */}
            {renderQueryCard("summary", "Resumen por país (mode=rent)", TrendingUp, result.queries.summary)}

            {/* Raw pricing card */}
            {renderQueryCard("pricing", "Pricing API (mode=rent, service=anyother)", Server, result.queries.pricing)}

            {/* Parsed rental catalog */}
            {rentalRows.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                      <Boxes className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Catálogo parseado — {rentalRows.length} ofertas en {groupedByCountry.length} países
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filtrar por país o duración..."
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Country cards */}
                  <div className="space-y-4">
                    {groupedByCountry.map(([country, rows]) => (
                      <div
                        key={country}
                        className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden"
                      >
                        {/* Country header */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/40 px-4 py-3">
                          <span className="text-2xl">{getCountryFlag(country)}</span>
                          <div>
                            <div className="text-sm font-bold text-white">{getCountryName(country)}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">
                              {country} · {rows.length} duraciones disponibles
                            </div>
                          </div>
                        </div>

                        {/* Duration rows */}
                        <div className="divide-y divide-zinc-800/30">
                          {rows.map((row, i) => (
                            <div
                              key={`${country}-${row.durationMinutes}-${i}`}
                              className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-4 lg:grid-cols-6"
                            >
                              {/* Duration */}
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                                <span className="text-xs font-semibold text-white">
                                  {row.durationLabel}
                                </span>
                              </div>

                              {/* Price */}
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-mono font-bold text-amber-400">
                                  ${(row.price / 100).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-zinc-500">{row.currency}</span>
                              </div>

                              {/* Stock */}
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-zinc-500">Stock:</span>
                                <span
                                  className={`text-xs font-mono font-semibold ${
                                    row.stock > 0 ? "text-emerald-400" : "text-red-400"
                                  }`}
                                >
                                  {row.stock > 0 ? row.stock : "—"}
                                </span>
                              </div>

                              {/* Delivery rate */}
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-zinc-500" />
                                <span className="text-xs font-mono text-zinc-300">
                                  {(row.deliveryRate * 100).toFixed(0)}%
                                </span>
                              </div>

                              {/* Renewable */}
                              <div className="flex items-center gap-1">
                                <RotateCcw className="h-3 w-3 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400">Renovable</span>
                              </div>

                              {/* Refundable (based on cancel endpoint availability) */}
                              <div className="flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-zinc-500" />
                                <span className="text-[10px] text-zinc-400">
                                  Cancel: sí
                                </span>
                              </div>

                              {/* VoIP badge */}
                              {row.isVoip && (
                                <div className="col-span-2 sm:col-span-4 lg:col-span-6">
                                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400">
                                    VoIP
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No results banner */}
            {result.queries.pricing && rentalRows.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      No se parsearon ofertas de rental con service=anyother
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Revisa el JSON crudo de la sección "Pricing API" arriba.
                      Es posible que el servicio "anyother" no esté disponible en modo rent
                      para los países consultados, o que el formato de respuesta sea diferente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* API reference info */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="text-sm font-bold text-white mb-3">Endpoints nativos usados</h3>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex items-start gap-2">
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400 text-[10px]">GET</code>
                  <code className="text-zinc-300">/api/v1/numbers/countries?mode=rent</code>
                </div>
                <div className="flex items-start gap-2">
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400 text-[10px]">GET</code>
                  <code className="text-zinc-300">/api/v1/numbers/products?mode=rent</code>
                </div>
                <div className="flex items-start gap-2">
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400 text-[10px]">GET</code>
                  <code className="text-zinc-300">/api/v1/numbers/pricing?mode=rent&country={"{iso2}"}&service=anyother</code>
                </div>
                <div className="flex items-start gap-2">
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400 text-[10px]">GET</code>
                  <code className="text-zinc-300">/api/v1/numbers/summary?mode=rent</code>
                </div>
                <div className="flex items-start gap-2">
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400 text-[10px]">GET</code>
                  <code className="text-zinc-300">/api/v1/wallet</code>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-500">
                <p>Autenticación: Bearer token (API key en servidor, nunca en navegador).</p>
                <p className="mt-1">
                  La compra usará <code className="text-zinc-400">POST /api/v1/numbers/orders</code> con
                  {" "}<code className="text-zinc-400">mode=rent</code>,{" "}
                  <code className="text-zinc-400">service=anyother</code>,
                  {" "}<code className="text-zinc-400">country</code> y{" "}
                  <code className="text-zinc-400">duration_minutes</code>.
                </p>
                <p className="mt-1">
                  Auto-renew: <code className="text-zinc-400">POST /api/v1/numbers/orders/{"{uuid}"}/auto-renew</code>.
                  {" "}Extender: <code className="text-zinc-400">POST .../{"{uuid}"}/extend</code>.
                  {" "}Cancelar: <code className="text-zinc-400">POST .../{"{uuid}"}/cancel</code>.
                </p>
              </div>
            </div>
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

// Helper: parse a single country's pricing data into rental rows
function parsePricingForCountry(country: string, data: PricingData): RentalRow[] {
  const rows: RentalRow[] = [];
  if (!data.services || !Array.isArray(data.services)) return rows;

  const currency = data.currency || "USD";

  for (const service of data.services) {
    // We only care about "anyother" service
    if (service.name !== "anyother") continue;

    for (const dur of service.durations || []) {
      const cheapestOption = dur.options && dur.options.length > 0
        ? dur.options.reduce((min, opt) => opt.price < min.price ? opt : min, dur.options[0])
        : { delivery: 0, count: 0, is_voip: dur.is_voip };

      rows.push({
        country,
        countryName: getCountryName(country),
        service: service.name,
        durationLabel: formatDuration(dur.duration),
        durationMinutes: dur.duration,
        price: dur.price,
        currency,
        stock: dur.count || cheapestOption.count || 0,
        deliveryRate: cheapestOption.delivery || 0,
        isVoip: dur.is_voip || cheapestOption.is_voip || false,
        renewable: true, // rentals support auto-renew per API docs
        refundable: true, // cancel endpoint refunds where provider supports it
      });
    }
  }

  return rows;
}
