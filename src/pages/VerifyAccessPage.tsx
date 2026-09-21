import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  MessageSquare,
  Clock,
  RefreshCw,
  Check,
  Copy,
  AlertTriangle,
  Zap,
  ShieldCheck,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";
import { PhoneCountryFlag } from "@/components/CountryFlag";
import type { VerificationPurchase } from "@/types";

export function VerifyAccessPage() {
  const { token } = useParams<{ token: string }>();
  const { t, localizedPath } = useLang();
  const tv = t.verify;

  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState<VerificationPurchase | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  const fetchPurchase = useCallback(async () => {
    if (!token) return;
    const { data } = await supabase.rpc("get_verification_by_token", {
      p_access_token: token,
    });
    if (data && data.length > 0) {
      setPurchase(data[0] as VerificationPurchase);
    } else {
      setPurchase(null);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchPurchase();
  }, [fetchPurchase]);

  // Auto-refresh every 5 seconds while waiting for SMS
  useEffect(() => {
    if (purchase && purchase.status === "waiting_sms") {
      const interval = setInterval(() => {
        fetchPurchase();
        setNow(Date.now());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [purchase, fetchPurchase]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatCountdown = (expiresAt: string) => {
    const remaining = Math.max(0, new Date(expiresAt).getTime() - now);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-16 sm:pt-20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-sm text-zinc-400">{tv.processing}</p>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-16 sm:pt-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-white">{tv.invalidLink}</h2>
          <p className="mt-2 text-sm text-zinc-400">{tv.invalidLinkDesc}</p>
          <a
            href={localizedPath("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:from-blue-400 hover:to-blue-500 transition-all"
          >
            <Home className="h-4 w-4" />
            {tv.backHome}
          </a>
        </div>
      </div>
    );
  }

  const isCompleted = purchase.status === "completed";
  const isExpired = purchase.status === "expired" || new Date(purchase.expires_at).getTime() < now;

  return (
    <div className="w-full max-w-full overflow-hidden pt-16 sm:pt-20">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50"
            style={{ backgroundColor: `${purchase.service_color || "#3B82F6"}20` }}
          >
            <MessageSquare className="h-5 w-5" style={{ color: purchase.service_color || "#3B82F6" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{purchase.service_name}</h1>
            <p className="text-sm text-zinc-400">{tv.modalTitle}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-6 flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              {tv.statusCompleted}
            </span>
          ) : isExpired ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300">
              <Clock className="h-3.5 w-3.5" />
              {tv.expired}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              {tv.statusWaiting}
            </span>
          )}
          {!isExpired && !isCompleted && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              {tv.expiresIn} {formatCountdown(purchase.expires_at)}
            </span>
          )}
        </div>

        {/* Phone number card */}
        {purchase.phone_number && (
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 p-1.5 shadow-inner">
                <PhoneCountryFlag
                  phone={{
                    id: purchase.id,
                    number: purchase.phone_number,
                    country_code: purchase.country_code || "",
                    country_name: purchase.country_name || "",
                    country_flag: purchase.country_flag || "",
                    type: "free",
                    is_active: true,
                    received_count: 0,
                    last_sms_at: null,
                    created_at: purchase.created_at,
                  }}
                  className="h-7 w-5"
                />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-lg font-bold text-white tracking-tight">
                  {purchase.phone_number}
                </div>
                <div className="text-xs text-zinc-400">{purchase.country_name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Code received */}
        {isCompleted && purchase.verification_code ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-400">
              <Check className="h-5 w-5" />
              {tv.codeReceived}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-zinc-950/80 px-6 py-3">
                <span className="font-mono text-3xl font-black text-white tracking-wider">
                  {purchase.verification_code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(purchase.verification_code!)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? tv.copied : tv.copyCode}
              </button>
            </div>
            {purchase.sms_message && (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left">
                <div className="text-[10px] uppercase font-semibold text-zinc-500 mb-1">
                  {t.sms.message}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{purchase.sms_message}</p>
                {purchase.sms_sender && (
                  <div className="mt-2 text-[10px] text-zinc-500">
                    {t.sms.sender}: <span className="font-semibold text-zinc-300">{purchase.sms_sender}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isExpired ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-2 text-sm font-semibold text-red-300">{tv.expired}</p>
            <p className="mt-1 text-xs text-zinc-400">{tv.invalidLinkDesc}</p>
          </div>
        ) : (
          /* Waiting for SMS */
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <RefreshCw className="h-7 w-7 text-amber-400 animate-spin" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">{tv.waitingTitle}</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">{tv.waitingSub}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {tv.autoRefresh}
              </span>
            </div>
          </div>
        )}

        {/* Info badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold text-blue-300">
            <Zap className="h-3.5 w-3.5" />
            {tv.instantCode}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {tv.privateAccess}
          </span>
        </div>

        {/* Back home */}
        <div className="mt-8 text-center">
          <a
            href={localizedPath("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {tv.backHome}
          </a>
        </div>
      </div>
    </div>
  );
}
