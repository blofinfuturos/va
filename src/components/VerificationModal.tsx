import { useState, useEffect } from "react";
import {
  X,
  Check,
  Copy,
  Clock,
  ShieldCheck,
  Zap,
  Lock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/AuthContext";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";
import type { VerificationService } from "@/types";
import { useNavigate } from "react-router-dom";

type VerificationModalProps = {
  service: VerificationService | null;
  isOpen: boolean;
  onClose: () => void;
};

export function VerificationModal({ service, isOpen, onClose }: VerificationModalProps) {
  const { user } = useAuth();
  const { t, localizedPath } = useLang();
  const navigate = useNavigate();

  const tv = t.verify;

  const [buyerEmail, setBuyerEmail] = useState("");
  const [step, setStep] = useState<"config" | "processing" | "success">("config");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("config");
      setErrorMsg(null);
      if (user?.email) setBuyerEmail(user.email);
    }
  }, [isOpen, user]);

  if (!isOpen || !service) return null;

  const handlePurchase = async () => {
    setStep("processing");
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.rpc("create_verification_purchase", {
        p_service_id: service.id,
        p_guest_email: buyerEmail.trim() || null,
        p_price: service.price,
      });

      if (error) throw error;

      const token = data?.access_token;
      if (!token) throw new Error("No se pudo crear la verificación");

      setAccessToken(token);
      setStep("success");
    } catch (err: any) {
      console.error("Error creating verification:", err);
      setErrorMsg(err.message || "Error al procesar la compra");
      setStep("config");
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${localizedPath(`/verify/${accessToken}`)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7 shadow-2xl transition-all"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700/50"
              style={{ backgroundColor: `${service.color}20` }}
            >
              <MessageSquare className="h-5 w-5" style={{ color: service.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">{tv.modalTitle}</h3>
                <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-400">
                  {service.name}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{tv.modalSubtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Price summary */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-3.5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700/50"
              style={{ backgroundColor: `${service.color}20` }}
            >
              <MessageSquare className="h-6 w-6" style={{ color: service.color }} />
            </div>
            <div>
              <div className="font-bold text-white">{service.name}</div>
              <div className="text-xs text-zinc-400">{tv.selectService}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400">{tv.price}</div>
            <div className="text-lg font-black text-blue-400">
              {service.price.toFixed(2)} €
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* STEP 1: CONFIG */}
        {step === "config" && (
          <div className="mt-4 space-y-4">
            {/* Email (optional) */}
            {!user && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    {tv.yourEmail}
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {tv.emailOptional}
                  </span>
                </div>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Buy button */}
            <button
              type="button"
              onClick={handlePurchase}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/10 hover:from-blue-400 hover:to-blue-500 transition-all"
            >
              <Zap className="h-4 w-4" />
              {tv.payBtn}
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                {tv.privateAccess}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                {tv.noRegistration}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-blue-400" />
                {tv.instantCode}
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING */}
        {step === "processing" && (
          <div className="py-10 text-center space-y-4">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">{tv.processing}</h4>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Check className="h-7 w-7" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">{tv.successTitle}</h4>
              <p className="mt-1 text-xs text-zinc-400">{tv.successSub}</p>
            </div>

            {/* Private link */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-yellow-500/5 p-4 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Bookmark className="h-4 w-4" />
                <span>{tv.yourLink}</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-300/80 leading-relaxed">
                {tv.saveLinkWarn}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-zinc-950/80 p-2 text-xs">
                <span className="truncate font-mono text-zinc-300 select-all pr-2">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}${localizedPath(`/verify/${accessToken}`)}`
                    : `/verify/${accessToken}`}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-[11px] font-bold text-zinc-950 shadow-sm hover:from-amber-400 hover:to-yellow-400 transition-all"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? tv.copied : tv.copyLink}
                </button>
              </div>
            </div>

            {/* Go to verification */}
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(localizedPath(`/verify/${accessToken}`));
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/10 hover:from-blue-400 hover:to-blue-500 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              {tv.goToVerify}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
