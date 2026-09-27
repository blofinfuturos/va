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
  Tag,
  Boxes,
  Globe2,
  Wallet,
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
    prices?: QueryResult;
    stock?: QueryResult;
    operators?: QueryResult;
    balance?: QueryResult;
  };
};

type PriceRow = {
  country: string;
  service: string;
  cost: string;
  count: string;
};

type StockEntry = {
  service: string;
  count: number;
};

export function EvesesCatalogTestPage() {
  const { localizedPath } = useLang();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CatalogResponse | null>(null);
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const runQuery = async (action: string = "all") => {
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

  // Parse getPrices response: {"0":{"tg":{"cost":0.50,"count":7}}}
  const priceRows = useMemo<PriceRow[]>(() => {
    if (!result?.queries?.prices?.data) return [];
    const prices = result.queries.prices.data;
    const rows: PriceRow[] = [];

    if (typeof prices === "object" && prices !== null && !Array.isArray(prices)) {
      for (const [countryKey, countryVal] of Object.entries(prices as Record<string, unknown>)) {
        if (typeof countryVal === "object" && countryVal !== null) {
          for (const [serviceKey, serviceVal] of Object.entries(countryVal as Record<string, unknown>)) {
            if (typeof serviceVal === "object" && serviceVal !== null) {
              const sv = serviceVal as Record<string, unknown>;
              rows.push({
                country: countryKey,
                service: serviceKey,
                cost: sv.cost != null ? String(sv.cost) : sv.price != null ? String(sv.price) : "—",
                count: sv.count != null ? String(sv.count) : "—",
              });
            }
          }
        }
      }
    }
    return rows;
  }, [result]);

  // Parse getNumbersStatus response: {"tg_0":12,"wa_0":3}
  const stockEntries = useMemo<StockEntry[]>(() => {
    if (!result?.queries?.stock?.data) return [];
    const stock = result.queries.stock.data;
    const entries: StockEntry[] = [];

    if (typeof stock === "object" && stock !== null && !Array.isArray(stock)) {
      for (const [key, val] of Object.entries(stock as Record<string, unknown>)) {
        // Keys are like "tg_0" (service_country) or just "tg"
        const service = key.split("_")[0];
        const count = typeof val === "number" ? val : parseInt(String(val), 10) || 0;
        entries.push({ service, count });
      }
    }
    return entries;
  }, [result]);

  // Merge price rows with stock data for the unified table
  const unifiedRows = useMemo(() => {
    if (priceRows.length === 0) return [];
    const stockMap = new Map<string, number>();
    for (const s of stockEntries) {
      stockMap.set(s.service, s.count);
    }
    return priceRows.map((r) => ({
      ...r,
      stock: stockMap.get(r.service) ?? r.count ?? "—",
    }));
  }, [priceRows, stockEntries]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return unifiedRows.slice(0, 300);
    const q = searchTerm.toLowerCase();
    return unifiedRows
      .filter((r) => r.country.toLowerCase().includes(q) || r.service.toLowerCase().includes(q))
      .slice(0, 300);
  }, [unifiedRows, searchTerm]);

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
                <span className="ml-1.5 text-[10px] text-zinc-500">
                  country={query.queriedCountry}
                </span>
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
            Catálogo Eveses — Precios y Stock
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
            Consulta los datos reales de la API de Eveses: países, precios, stock y operadores.
            Usa el gateway sms-activate compatible. No se compra ni reserva nada.
          </p>
        </div>

        <div className="mb-6 flex flex-col items-center gap-3">
          <button
            onClick={() => runQuery("all")}
            disabled={loading}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-7 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/10 transition-all hover:from-amber-400 hover:to-yellow-400 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Consultando catálogo...
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
            {/* Info cards row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renderQueryCard("countries", "Países (getCountries)", Globe2, result.queries.countries)}
              {renderQueryCard("operators", "Operadores (getOperators)", Server, result.queries.operators)}
              {renderQueryCard("balance", "Balance (getBalance)", Wallet, result.queries.balance)}
            </div>

            {/* Stock card */}
            {renderQueryCard("stock", "Stock / Disponibilidad (getNumbersStatus)", Boxes, result.queries.stock)}

            {/* Unified prices + stock table */}
            {result.queries.prices && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        result.queries.prices.ok
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white">Precios + Stock (getPrices)</span>
                      <span
                        className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          result.queries.prices.ok
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        HTTP {result.queries.prices.httpStatus}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRaw("prices")}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    {showRaw.prices ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showRaw.prices ? "Ocultar JSON" : "Ver JSON"}
                  </button>
                </div>

                <div className="p-4">
                  {unifiedRows.length > 0 ? (
                    <>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Filtrar por país o servicio..."
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-zinc-800 text-left">
                              <th className="py-2 px-3 font-semibold text-zinc-400 uppercase tracking-wider">País</th>
                              <th className="py-2 px-3 font-semibold text-zinc-400 uppercase tracking-wider">Servicio</th>
                              <th className="py-2 px-3 font-semibold text-zinc-400 uppercase tracking-wider">Precio (USD)</th>
                              <th className="py-2 px-3 font-semibold text-zinc-400 uppercase tracking-wider">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRows.map((row, i) => (
                              <tr
                                key={`${row.country}-${row.service}-${i}`}
                                className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors"
                              >
                                <td className="py-2 px-3 font-mono text-zinc-200">{row.country}</td>
                                <td className="py-2 px-3 font-mono text-zinc-200">{row.service}</td>
                                <td className="py-2 px-3 font-mono text-amber-400 font-semibold">
                                  {row.cost !== "—" ? `$${row.cost}` : "—"}
                                </td>
                                <td className="py-2 px-3 font-mono text-emerald-400 font-semibold">
                                  {row.stock}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {unifiedRows.length > 300 && !searchTerm && (
                          <p className="mt-2 text-xs text-zinc-500 text-center">
                            Mostrando 300 de {unifiedRows.length} filas. Usa el filtro para buscar.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-zinc-400">
                      <AlertTriangle className="inline h-4 w-4 mr-1 text-amber-400" />
                      No se pudo extraer una tabla de precios. Revisa el JSON crudo.
                    </div>
                  )}

                  {showRaw.prices && (
                    <pre className="mt-3 max-h-80 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap break-all">
                      {JSON.stringify(result.queries.prices.data, null, 2)}
                    </pre>
                  )}

                  {!result.queries.prices.ok && (
                    <div className="mt-2 text-xs text-red-300 font-mono break-all">
                      {result.queries.prices.raw}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rentals info banner */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Rentals / Alquileres</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Las acciones de rental en el gateway sms-activate{" "}
                (<code className="text-zinc-300">getRentNumber</code>,{" "}
                <code className="text-zinc-300">getRentStatus</code>,{" "}
                <code className="text-zinc-300">getRentServicesAndCountries</code>,{" "}
                <code className="text-zinc-300">setRentStatus</code>){" "}
                <strong className="text-amber-400">no están implementadas</strong> actualmente
                y devuelven <code className="text-zinc-300">BAD_ACTION</code>.
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                No hay endpoint REST nativo para consultar catálogo de rentals.
                Las duraciones documentadas son:{" "}
                <span className="font-mono text-zinc-300">60, 240, 1440, 10080, 43200 minutos</span>
                {" "}(1h, 4h, 24h, 7 días, 30 días). El auto-renew existe como evento webhook
                {" "}<code className="text-zinc-300">rent.auto_renewed</code> y se gestiona vía
                {" "}<code className="text-zinc-300">POST /api/account/orders/{"{id}"}/auto-renew</code>.
              </p>
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
