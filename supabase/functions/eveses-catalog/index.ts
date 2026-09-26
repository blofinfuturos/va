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
    const service = url.searchParams.get("service");

    const authHeaders: Record<string, string> = {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json",
    };

    const baseUrl = "https://api.eveses.com";

    // Helper: try native REST API first, fall back to sms-activate compatible gateway
    async function tryFetch(path: string): Promise<{ ok: boolean; status: number; data: unknown; raw: string }> {
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

    async function tryGateway(actionName: string, extraParams: string = ""): Promise<{ ok: boolean; status: number; data: unknown; raw: string }> {
      const url2 = `${baseUrl}/stubs/handler_api.php?api_key=${encodeURIComponent(apiKey)}&action=${actionName}${extraParams}`;
      const res = await fetch(url2, { headers: { "Accept": "application/json" } });
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

    // 1. Countries — try native first, then gateway
    if (action === "all" || action === "countries") {
      let countriesResult;
      // Try native REST endpoint
      countriesResult = await tryFetch("/api/v1/countries");
      if (!countriesResult.ok) {
        // Try gateway
        countriesResult = await tryGateway("getCountries");
      }
      (result.queries as Record<string, unknown>).countries = {
        httpStatus: countriesResult.status,
        ok: countriesResult.ok,
        data: countriesResult.data,
        raw: countriesResult.raw.substring(0, 500),
      };
    }

    // 2. Services — try native, then gateway
    if (action === "all" || action === "services") {
      let servicesResult;
      servicesResult = await tryFetch("/api/v1/services");
      if (!servicesResult.ok) {
        servicesResult = await tryGateway("getServices");
      }
      (result.queries as Record<string, unknown>).services = {
        httpStatus: servicesResult.status,
        ok: servicesResult.ok,
        data: servicesResult.data,
        raw: servicesResult.raw.substring(0, 500),
      };
    }

    // 3. Prices — try native, then gateway
    if (action === "all" || action === "prices") {
      let pricesResult;
      const nativePath = country
        ? `/api/v1/prices?country=${encodeURIComponent(country)}${service ? `&service=${encodeURIComponent(service)}` : ""}`
        : `/api/v1/prices`;
      pricesResult = await tryFetch(nativePath);
      if (!pricesResult.ok) {
        const gatewayParams = country ? `&country=${encodeURIComponent(country)}` : "";
        const serviceParams = service ? `&service=${encodeURIComponent(service)}` : "";
        pricesResult = await tryGateway("getPrices", gatewayParams + serviceParams);
      }
      (result.queries as Record<string, unknown>).prices = {
        httpStatus: pricesResult.status,
        ok: pricesResult.ok,
        data: pricesResult.data,
        raw: pricesResult.raw.substring(0, 500),
      };
    }

    // 4. Stock / Numbers status — gateway getNumbersStatus
    if (action === "all" || action === "stock") {
      let stockResult;
      const nativePath = country ? `/api/v1/numbers/status?country=${encodeURIComponent(country)}` : "/api/v1/numbers/status";
      stockResult = await tryFetch(nativePath);
      if (!stockResult.ok) {
        const gatewayParams = country ? `&country=${encodeURIComponent(country)}` : "";
        stockResult = await tryGateway("getNumbersStatus", gatewayParams);
      }
      (result.queries as Record<string, unknown>).stock = {
        httpStatus: stockResult.status,
        ok: stockResult.ok,
        data: stockResult.data,
        raw: stockResult.raw.substring(0, 500),
      };
    }

    // 5. Rental durations — from docs: 60, 240, 1440, 10080, 43200 minutes
    // The API may have an endpoint to query available durations; try native first
    if (action === "all" || action === "rentals") {
      let rentalsResult;
      // Try rental catalog/pricing endpoint
      const rentalPath = country
        ? `/api/v1/rentals/prices?country=${encodeURIComponent(country)}${service ? `&service=${encodeURIComponent(service)}` : ""}`
        : "/api/v1/rentals/prices";
      rentalsResult = await tryFetch(rentalPath);
      if (!rentalsResult.ok) {
        // Try alternative path
        rentalsResult = await tryFetch("/api/v1/rentals/catalog");
      }
      (result.queries as Record<string, unknown>).rentals = {
        httpStatus: rentalsResult.status,
        ok: rentalsResult.ok,
        data: rentalsResult.data,
        raw: rentalsResult.raw.substring(0, 500),
        // Known durations from docs: 60, 240, 1440, 10080, 43200 minutes
        documentedDurations: [
          { minutes: 60, label: "1 hour" },
          { minutes: 240, label: "4 hours" },
          { minutes: 1440, label: "24 hours / 1 day" },
          { minutes: 10080, label: "7 days / 1 week" },
          { minutes: 43200, label: "30 days / 1 month" },
        ],
        renewableFromDocs: true,
      };
    }

    // 6. Operators (may give stock/availability info)
    if (action === "all" || action === "operators") {
      let operatorsResult;
      operatorsResult = await tryGateway("getOperators");
      (result.queries as Record<string, unknown>).operators = {
        httpStatus: operatorsResult.status,
        ok: operatorsResult.ok,
        data: operatorsResult.data,
        raw: operatorsResult.raw.substring(0, 500),
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
