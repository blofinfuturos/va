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
          error: "EVSES_API_KEY secret is not configured in Supabase Edge Function secrets.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "all";
    const country = url.searchParams.get("country");

    const baseUrl = "https://api.eveses.com";

    async function gateway(
      actionName: string,
      extraParams: string = ""
    ): Promise<{ ok: boolean; status: number; data: unknown; raw: string }> {
      const gwUrl = `${baseUrl}/api/gateway/sms-activate?api_key=${encodeURIComponent(apiKey)}&action=${actionName}${extraParams}`;
      const res = await fetch(gwUrl, { headers: { Accept: "application/json" } });
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

    // 1. Countries — gateway getCountries
    if (action === "all" || action === "countries") {
      const r = await gateway("getCountries");
      (result.queries as Record<string, unknown>).countries = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 1000),
      };
    }

    // 2. Prices — gateway getPrices (optional country + service filters)
    if (action === "all" || action === "prices") {
      const params = country ? `&country=${encodeURIComponent(country)}` : "";
      const r = await gateway("getPrices", params);
      (result.queries as Record<string, unknown>).prices = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 2000),
      };
    }

    // 3. Stock — gateway getNumbersStatus (country is required)
    if (action === "all" || action === "stock") {
      // If no country specified, try country=0 (RU) as a default to get something
      const stockCountry = country || "0";
      const r = await gateway("getNumbersStatus", `&country=${encodeURIComponent(stockCountry)}`);
      (result.queries as Record<string, unknown>).stock = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 2000),
        queriedCountry: stockCountry,
      };
    }

    // 4. Operators — gateway getOperators
    if (action === "all" || action === "operators") {
      const r = await gateway("getOperators");
      (result.queries as Record<string, unknown>).operators = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 1000),
      };
    }

    // 5. Balance — gateway getBalance (useful context for catalog)
    if (action === "all" || action === "balance") {
      const r = await gateway("getBalance");
      (result.queries as Record<string, unknown>).balance = {
        httpStatus: r.status,
        ok: r.ok,
        data: r.data,
        raw: r.raw.substring(0, 200),
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
