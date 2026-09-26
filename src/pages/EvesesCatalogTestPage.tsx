import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Globe2,
  Server,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  Tag,
  Boxes,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";

type QueryResult = {
  httpStatus: number;
  ok: boolean;
  data: unknown;
  raw: string;
};

type CatalogResponse = {
  success: boolean;
  error?: string;
  detail?: string;
  queries?: {
    countries?: QueryResult;
    services?: QueryResult;
    prices?: QueryResult;
    stock?: QueryResult;
    rentals?: QueryResult & {
      documentedDurations?: { minutes: number; label: string }[];
      renewableFromDocs?: boolean;
    };
    operators?: QueryResult;
  };
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

  // Try to parse prices into a table format
  const priceRows = useMemo(() => {
    if (!result?.queries?.prices?.data) return [];
    const prices = result.queries.prices.data;
    const rows: { country: string; service: string; cost: string; count: string }[] = [];

    if (typeof prices === "object" && prices !== null && !Array.isArray(prices)) {
      // Format: {"0": {"tg": {"cost": 0.50, "count": 7}}, ...} (sms-activate format)
      // or native format
      for (const [countryKey, countryVal] of Object.entries(prices as Record<string, unknown>)) {
        if (typeof countryVal === "object" && countryVal !== null) {
          for (const [serviceKey, serviceVal] of Object.entries(countryVal as Record<string, unknown>)) {
            if (typeof serviceVal === "object" && serviceVal !== null) {
              const sv = serviceVal as Record<string, unknown>;
              rows.push({
                country: countryKey,
                service: serviceKey,
                cost: String(sv.cost ?? sv.price ?? sv.price_cents ?? "—"),
                count: String(sv.count ?? sv.stock ?? sv.available ?? "—"),
              });
            }
          }
        }
      }
    }
    return rows;
  }, [result]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return priceRows.slice(0, 200);
    const q = searchTerm.toLowerCase();
    return priceRows
      .filter((r) => r.country.toLowerCase().includes(q) || r.service.toLowerCase().includes(q))
      .slice(0, 200);
  }, [priceRows, searchTerm]);

  const renderQueryCard = (
    key: string,
    label: string,
    icon: typeof Globe2,
    query?: QueryResult & { documentedDurations?: { minutes: number; label: string }[]; renewableFromDocs?: boolean }
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
                  query.ok
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                HTTP {query.httpStatus}
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleRaw(key)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {showRaw[key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showRaw[key] ? "Ocultar JSON" : "Ver JSON"}
          </button>
        </div>

        <div className="p-4">
          {/* Parsed summary */}
          {query.ok && query.data && (
            <div className="text-xs text-zinc-400 mb-2">
              {Array.isArray(query.data) ? (
                <span>{(query.data as unknown[]).length} elementos en array</span>
              ) : typeof query.data === "object" && query.data !== null ? (
                <span>{Object.keys(query.data as object).length} claves en objeto</span>
              ) : typeof query.data === "string" ? (
                <span className="font-mono text-zinc-300">{(query.data as string).substring(0, 200)}</span>
              ) : (
                <span>{String(query.data)}</span>
              )}
            </div>
          )}

          {/* Rental-specific info */}
          {key === "rentals" && query.documentedDurations && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                <Clock className="h-3.5 w-3.5" />
                Duraciones documentadas (según docs de Eveses):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {query.documentedDurations.map((d) => (
                  <div
                    key={d.minutes}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                  >
                    <div className="font-mono text-sm font-bold text-white">{d.minutes} min</div>
                    <div className="text-[11px] text-zinc-400">{d.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                <RotateCcw className="h-3.5 w-3.5" />
                Renovable: Sí (auto-renew disponible vía endpoint dedicado)
              </div>
            </div>
          )}

          {/* Raw JSON */}
          {showRaw[key] && (
            <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap break-all">
              {JSON.stringify(query.data, null, 2)}
            </pre>
          )}

          {/* Error raw text */}
          {!query.ok && (
            <div className="mt-1 text-xs text-red-300 font-mono break-all">
              {query.raw}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-hidden pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to={localizedPath("/")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <Boxes className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Catálogo Eveses — Países, Servicios y Precios
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
            Consulta los datos reales que devuelve la API de Eveses: países disponibles,
            servicios, precios, stock y duraciones de alquiler. No se compra ni reserva nada.
          </p>
        </div>

        {/* Run button */}
        <div className="mb-6 flex justify-center">
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

        {/* Error */}
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

        {/* Results */}
        {result?.queries && (
          <div className="space-y-4">
            {/* Query cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {renderQueryCard("countries", "Países", Globe2, result.queries.countries)}
              {renderQueryCard("services", "Servicios", Tag, result.queries.services)}
              {renderQueryCard("stock", "Stock / Disponibilidad", Boxes, result.queries.stock)}
              {renderQueryCard("operators", "Operadores", Server, result.queries.operators)}
            </div>

            {/* Rentals (full width) */}
            {renderQueryCard("rentals", "Alquileres / Rentals", Clock, result.queries.rentals)}

            {/* Prices table */}
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
                      <span className="text-sm font-bold text-white">Precios</span>
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
                  {/* Search filter */}
                  {priceRows.length > 0 && (
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
                  )}

                  {/* Table */}
                  {priceRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 text-left">
                            <th className="py-2 px-3 font-semibold text-zinc-400 uppercase tracking-wider">País</th>
                            <th className="py-2 px-3 font-semibold text-zinc-400 uppercase tracking-wider">Servicio</th>
                            <th className="py-2 px-3 font-semibold text-zinc-400 uppercase tracking-wider">Precio (cost)</th>
                            <th className="py-2 px-3 font-semibold text-zinc-400 uppercase tracking-wider">Stock (count)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRows.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors"
                            >
                              <td className="py-2 px-3 font-mono text-zinc-200">{row.country}</td>
                              <td className="py-2 px-3 font-mono text-zinc-200">{row.service}</td>
                              <td className="py-2 px-3 font-mono text-amber-400 font-semibold">{row.cost}</td>
                              <td className="py-2 px-3 font-mono text-emerald-400 font-semibold">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {priceRows.length > 200 && !searchTerm && (
                        <p className="mt-2 text-xs text-zinc-500 text-center">
                          Mostrando 200 de {priceRows.length} filas. Usa el filtro para buscar.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400">
                      <AlertTriangle className="inline h-4 w-4 mr-1 text-amber-400" />
                      No se pudo extraer una tabla de precios de la respuesta. Revisa el JSON crudo abajo.
                    </div>
                  )}

                  {/* Raw JSON */}
                  {showRaw.prices && (
                    <pre className="mt-3 max-h-80 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap break-all">
                      {JSON.stringify(result.queries.prices.data, null, 2)}
                    </pre>
                  )}

                  {/* Error */}
                  {!result.queries.prices.ok && (
                    <div className="mt-2 text-xs text-red-300 font-mono break-all">
                      {result.queries.prices.raw}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            Página de diagnóstico. La API Key nunca se muestra ni se envía al navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
