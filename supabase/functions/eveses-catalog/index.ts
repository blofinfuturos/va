// Eveses catalog Edge Function — queries the NATIVE REST API for rental pricing.
// Uses Bearer token auth (EVSES_API_KEY). No sms-activate gateway.
// Product: Private Number — Any Service (service=anyother, mode=rent)

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("EVSES_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "EVSES_API_KEY secret is not configured.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "countries";
    const country = url.searchParams.get("country");

    const baseUrl = "https://api.eveses.com";
    const authHeaders: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    };

    async function apiGet(path: string): Promise<{ ok: boolean; status: number; data: unknown; raw: string }> {
      const res = await fetch(`${baseUrl}${path}`, { headers: authHeaders });
      const text = await res.text();
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
      return { ok: res.ok, status: res.status, data: parsed, raw: text };
    }

    const result: Record<string, unknown> = { success: true, queries: {} };

    // 1. Rental countries — countries that have priced offers for mode=rent
    if (action === "countries") {
      const r = await apiGet("/api/v1/numbers/countries?mode=rent");
      (result.queries as Record<string, unknown>).countries = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 3000),
      };
    }

    // 2. Rental pricing for a SPECIFIC country (service=anyother, mode=rent)
    if (action === "pricing") {
      if (!country) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing 'country' parameter. Use action=pricing&country={iso2}.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const path = `/api/v1/numbers/pricing?mode=rent&country=${encodeURIComponent(country)}&service=anyother`;
      const r = await apiGet(path);
      (result.queries as Record<string, unknown>).pricing = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 10000),
        queriedCountry: country,
      };
    }

    // 3. Rental products — service codes available for mode=rent
    if (action === "products") {
      const r = await apiGet("/api/v1/numbers/products?mode=rent");
      (result.queries as Record<string, unknown>).products = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 2000),
      };
    }

    // 4. Rental summary — per-country roll-up for mode=rent
    if (action === "summary") {
      const r = await apiGet("/api/v1/numbers/summary?mode=rent");
      (result.queries as Record<string, unknown>).summary = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 3000),
      };
    }

    // 5. Balance — wallet balance for context
    if (action === "balance") {
      const r = await apiGet("/api/v1/wallet");
      (result.queries as Record<string, unknown>).balance = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 500),
      };
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Network or runtime error contacting Eveses API.",
        detail: message,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
