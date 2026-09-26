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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test connectivity + auth by fetching wallet balance from Eveses API.
    // This is a read-only GET that does NOT buy, reserve, or create anything.
    const response = await fetch("https://api.eveses.com/api/v1/wallet", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
    });

    const status = response.status;
    const responseText = await response.text();

    let parsedBody: unknown = null;
    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      parsedBody = responseText;
    }

    if (response.ok) {
      const data = parsedBody as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          success: true,
          httpStatus: status,
          message: "Eveses API connection successful — authentication is working.",
          wallet: {
            balance_cents: data?.balance_cents ?? data?.balance ?? null,
            currency: data?.currency ?? null,
          },
          rawKeys: Object.keys(data || {}),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Return error details for diagnosis (but never the API key)
      return new Response(
        JSON.stringify({
          success: false,
          httpStatus: status,
          error: "Eveses API returned an error status.",
          evesesResponse: parsedBody,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
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
