import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Clock, ShoppingBag, User, Crown, MessageSquare, TrendingUp, Calendar, ChevronRight, Check, X, Star, Shield } from "lucide-react";
import { useAuth } from "@/AuthContext";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";
import { PhoneCountryFlag } from "@/components/CountryFlag";
import { SmsModal } from "@/components/SmsModal";
import { formatDate, timeAgo } from "@/utils";
import type { PhoneNumber, SmsMessage } from "@/types";

type Rental = {
  id: string;
  phone_number_id: string;
  status: string;
  duration_hours: number;
  price: number;
  expires_at: string;
  created_at: string;
  phone_numbers?: PhoneNumber;
};

type Purchase = {
  id: string;
  type: string;
  amount: number;
  credits_purchased: number;
  status: string;
  created_at: string;
  phone_number_id: string | null;
};

const PLAN_PRICES = [
  { hours: 24, credits: 5, key: "plan24h", descKey: "plan24hDesc" },
  { hours: 168, credits: 25, key: "plan7d", descKey: "plan7dDesc" },
  { hours: 720, credits: 80, key: "plan30d", descKey: "plan30dDesc" },
] as const;

const CREDIT_PACKS = [
  { credits: 10, price: 2.99, key: "pack10", descKey: "pack10Desc" },
  { credits: 25, price: 6.99, key: "pack25", descKey: "pack25Desc" },
  { credits: 50, price: 12.99, key: "pack50", descKey: "pack50Desc" },
  { credits: 100, price: 22.99, key: "pack100", descKey: "pack100Desc" },
] as const;

export function DashboardPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { ta, t, lang, localizedPath } = useLang();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasePhone, setPurchasePhone] = useState<PhoneNumber | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate(localizedPath("/login"));
    }
  }, [user, loading, navigate, localizedPath]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [rentalsRes, purchasesRes] = await Promise.all([
        supabase
          .from("premium_number_rentals")
          .select("*, phone_numbers(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("purchases")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      setRentals((rentalsRes.data as Rental[]) || []);
      setPurchases((purchasesRes.data as Purchase[]) || []);
      setDataLoading(false);
    })();
  }, [user]);

  const handleBuyCredits = async (pack: (typeof CREDIT_PACKS)[number]) => {
    if (!user) return;
    setProcessing(true);
    setFeedback(null);

    const { data: purchaseData } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        type: "credits",
        amount: pack.price,
        credits_purchased: pack.credits,
        status: "completed",
      })
      .select()
      .single();

    if (purchaseData) {
      await supabase.rpc("add_credits", { p_user_id: user.id, p_amount: pack.credits });
      await refreshProfile();
      setFeedback({ type: "success", msg: ta.purchase.purchaseSuccess });
      setShowCreditsModal(false);
    } else {
      setFeedback({ type: "error", msg: ta.purchase.purchaseError });
    }

    setProcessing(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRentNumber = async () => {
    if (!user || !purchasePhone) return;
    const plan = PLAN_PRICES[selectedPlan];
    if ((profile?.credits ?? 0) < plan.credits) return;

    setProcessing(true);
    setFeedback(null);

    const { data: rentalData } = await supabase
      .from("premium_number_rentals")
      .insert({
        user_id: user.id,
        phone_number_id: purchasePhone.id,
        duration_hours: plan.hours,
        price: plan.credits,
        status: "active",
        expires_at: new Date(Date.now() + plan.hours * 3600000).toISOString(),
      })
      .select()
      .single();

    if (rentalData) {
      await supabase
        .from("purchases")
        .insert({
          user_id: user.id,
          phone_number_id: purchasePhone.id,
          type: "number_rental",
          amount: plan.credits,
          credits_purchased: 0,
          status: "completed",
        });

      await supabase.rpc("deduct_credits", { p_user_id: user.id, p_amount: plan.credits });
      await refreshProfile();

      const { data: updatedRentals } = await supabase
        .from("premium_number_rentals")
        .select("*, phone_numbers(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRentals((updatedRentals as Rental[]) || []);

      setFeedback({ type: "success", msg: ta.purchase.purchaseSuccessDesc });
      setShowPurchaseModal(false);
    } else {
      setFeedback({ type: "error", msg: ta.purchase.purchaseError });
    }

    setProcessing(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
      </div>
    );
  }

  const activeRentals = rentals.filter((r) => r.status === "active" && new Date(r.expires_at) > new Date());
  const completedPurchases = purchases.filter((p) => p.status === "completed");

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-20 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {feedback && (
          <div
            className={`fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-5 py-3 text-sm font-medium shadow-2xl ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{ta.dashboard.title}</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {ta.dashboard.welcome}, <span className="text-emerald-400">{user.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.is_admin && (
              <Link
                to={localizedPath("/admin")}
                className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 shadow-md shadow-amber-500/5"
              >
                <Shield className="h-4 w-4" />
                {ta.nav.admin}
              </Link>
            )}
            <button
              onClick={() => setShowCreditsModal(true)}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
            >
              <Wallet className="h-4 w-4" />
              {ta.dashboard.buyCredits}
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-red-500/30 hover:text-red-400"
            >
              {ta.nav.signOut}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{profile?.credits ?? 0}</div>
                <div className="text-sm text-zinc-400">{ta.dashboard.creditsBalance}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Crown className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{activeRentals.length}</div>
                <div className="text-sm text-zinc-400">{ta.dashboard.myRentals}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                <ShoppingBag className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{completedPurchases.length}</div>
                <div className="text-sm text-zinc-400">{ta.dashboard.myPurchases}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Rentals */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-6">
            <div className="mb-5 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">{ta.dashboard.myRentals}</h2>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800/40" />
                ))}
              </div>
            ) : rentals.length === 0 ? (
              <div className="py-10 text-center">
                <Crown className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-3 text-sm text-zinc-400">{ta.dashboard.noRentals}</p>
                <p className="mt-1 text-xs text-zinc-500">{ta.dashboard.noRentalsDesc}</p>
                <Link
                  to={localizedPath("/paid")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                >
                  {ta.dashboard.browseNumbers}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {rentals.map((rental) => {
                  const phone = rental.phone_numbers;
                  const isActive = rental.status === "active" && new Date(rental.expires_at) > new Date();
                  const statusText = isActive
                    ? ta.dashboard.rentalActive
                    : rental.status === "expired"
                    ? ta.dashboard.rentalExpired
                    : ta.dashboard.rentalCancelled;

                  return (
                    <div
                      key={rental.id}
                      className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                    >
                      {phone && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 p-1">
                          <PhoneCountryFlag phone={phone} className="h-6 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm font-bold text-white">{phone?.number ?? "—"}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" />
                          {ta.dashboard.expiresAt}: {formatDate(rental.expires_at)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {statusText}
                        </span>
                        {isActive && phone && (
                          <button
                            onClick={() => setSelectedPhone(phone)}
                            className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            {ta.dashboard.viewSms}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Purchases */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-6">
            <div className="mb-5 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">{ta.dashboard.myPurchases}</h2>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800/40" />
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className="py-10 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-3 text-sm text-zinc-400">{ta.dashboard.noPurchases}</p>
                <p className="mt-1 text-xs text-zinc-500">{ta.dashboard.noPurchasesDesc}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          purchase.type === "credits"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {purchase.type === "credits" ? <Wallet className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {purchase.type === "credits"
                            ? `${purchase.credits_purchased} ${ta.credits.credits}`
                            : t.numbers.premium}
                        </div>
                        <div className="text-xs text-zinc-500">{formatDate(purchase.created_at)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">€{purchase.amount.toFixed(2)}</div>
                      <div
                        className={`text-xs ${
                          purchase.status === "completed" ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        {purchase.status === "completed" ? <Check className="inline h-3 w-3" /> : <X className="inline h-3 w-3" />}
                        {" "}
                        {purchase.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account info */}
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-6">
          <div className="mb-5 flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">{ta.dashboard.accountInfo}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">{ta.auth.email}</div>
              <div className="mt-1 text-sm font-medium text-white">{user.email}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">{ta.dashboard.memberSince}</div>
              <div className="mt-1 text-sm font-medium text-white">{formatDate(profile?.created_at ?? new Date().toISOString())}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">{ta.dashboard.credits}</div>
              <div className="mt-1 text-sm font-medium text-emerald-400">{profile?.credits ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Modal */}
      {showCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreditsModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">{ta.credits.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{ta.credits.subtitle}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CREDIT_PACKS.map((pack, i) => (
                <button
                  key={i}
                  onClick={() => handleBuyCredits(pack)}
                  disabled={processing}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left transition-all hover:border-emerald-500/30 disabled:opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{pack.credits}</span>
                    <span className="text-lg font-bold text-emerald-400">€{pack.price}</span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {ta.credits[pack.descKey as keyof typeof ta.credits] as string}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreditsModal(false)}
              className="mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60"
            >
              {ta.purchase.cancel}
            </button>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      <SmsModal phone={selectedPhone} onClose={() => setSelectedPhone(null)} />

      {/* Purchase Modal */}
      {showPurchaseModal && purchasePhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPurchaseModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">{ta.purchase.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{ta.purchase.subtitle}</p>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 p-1.5">
                <PhoneCountryFlag phone={purchasePhone} className="h-7 w-5" />
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-white">{purchasePhone.number}</div>
                <div className="text-sm text-zinc-400">{purchasePhone.country_name}</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {PLAN_PRICES.map((plan, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPlan(i)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                    selectedPlan === i
                      ? "border-emerald-400 bg-emerald-400/5"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        selectedPlan === i ? "border-emerald-400 bg-emerald-400" : "border-zinc-600"
                      }`}
                    >
                      {selectedPlan === i && <Check className="h-3 w-3 text-zinc-950" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {ta.purchase[plan.key as keyof typeof ta.purchase] as string}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {ta.purchase[plan.descKey as keyof typeof ta.purchase] as string}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">{plan.credits}</div>
                    <div className="text-xs text-zinc-500">{ta.credits.credits}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <span className="text-sm text-zinc-400">{ta.purchase.yourCredits}</span>
              <span className="font-bold text-white">{profile?.credits ?? 0}</span>
            </div>

            {(profile?.credits ?? 0) < PLAN_PRICES[selectedPlan].credits && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {ta.purchase.insufficientCredits}: {PLAN_PRICES[selectedPlan].credits - (profile?.credits ?? 0)} {ta.credits.credits}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60"
              >
                {ta.purchase.cancel}
              </button>
              <button
                onClick={handleRentNumber}
                disabled={processing || (profile?.credits ?? 0) < PLAN_PRICES[selectedPlan].credits}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-white transition-all hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
              >
                {processing ? "..." : ta.purchase.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function openPurchaseModal(phone: PhoneNumber, setUserPhone: (phone: PhoneNumber) => void) {
  setUserPhone(phone);
}

export { PLAN_PRICES };
