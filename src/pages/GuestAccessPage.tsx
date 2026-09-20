import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Crown,
  Clock,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Phone,
  Bookmark,
  Share2,
  Lock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/supabaseClient";
import { useLang } from "@/LanguageContext";
import { PhoneCountryFlag } from "@/components/CountryFlag";
import { formatDate, timeAgo } from "@/utils";
import type { PhoneNumber, Rental, SmsMessage } from "@/types";

export function GuestAccessPage() {
  const { token, lang } = useParams<{ token: string; lang: string }>();
  const { ta, localizedPath } = useLang();
  const navigate = useNavigate();

  const [rental, setRental] = useState<Rental | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Time remaining calculation
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const prevMsgCount = useRef(0);

  // Load rental data by token
  const loadRentalData = async (isManual = false) => {
    if (!token) return;
    if (isManual) setRefreshing(true);

    try {
      // 1. Query Supabase
      const { data: rentalData, error } = await supabase
        .from("premium_number_rentals")
        .select("*, phone_numbers(*)")
        .eq("access_token", token)
        .maybeSingle();

      let activeRental = rentalData as Rental | null;

      // LocalStorage fallback if network / migration delay
      if (!activeRental) {
        try {
          const localStr = localStorage.getItem(`ghostsms_guest_${token}`);
          if (localStr) {
            activeRental = JSON.parse(localStr);
          }
        } catch (_) {}
      }

      if (activeRental) {
        setRental(activeRental);

        // Calculate seconds left
        const expTime = new Date(activeRental.expires_at).getTime();
        const now = Date.now();
        setSecondsRemaining(Math.max(0, Math.floor((expTime - now) / 1000)));

        // 2. Fetch SMS messages for this phone number
        if (activeRental.phone_number_id) {
          const { data: smsData } = await supabase
            .from("sms_messages")
            .select("*")
            .eq("phone_number_id", activeRental.phone_number_id)
            .order("received_at", { ascending: false });

          const fetched = (smsData as SmsMessage[]) || [];
          setMessages(fetched);

          if (prevMsgCount.current > 0 && fetched.length > prevMsgCount.current) {
            // New SMS arrived sound / visual alert
          }
          prevMsgCount.current = fetched.length;
        }
      }
    } catch (err) {
      console.error("Error loading guest rental:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRentalData();
  }, [token]);

  // Polling every 4 seconds for real-time incoming SMS
  useEffect(() => {
    if (!rental) return;
    const interval = setInterval(() => {
      loadRentalData();
    }, 4000);
    return () => clearInterval(interval);
  }, [rental?.id, token]);

  // 1-second countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const formatCountdown = (secs: number) => {
    if (secs <= 0) return "Alquiler Expirado";
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    if (days > 0) {
      return `Quedan ${days}d ${hours}h ${minutes}m`;
    }
    return `Quedan ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyNumber = () => {
    if (!rental?.phone_numbers?.number) return;
    navigator.clipboard.writeText(rental.phone_numbers.number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 3000);
  };

  const handleCopyCode = (code: string, msgId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(msgId);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Helper to extract 4-8 digit verification codes from message
  const extractCode = (text: string) => {
    const match = text.match(/\b([0-9]{4,8})\b/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24 pb-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-zinc-700 border-t-amber-400" />
          <p className="text-sm text-zinc-400">Cargando tu número privado...</p>
        </div>
      </div>
    );
  }

  if (!rental || !rental.phone_numbers) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-24 pb-12">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold text-white">Enlace de acceso no encontrado o expirado</h2>
          <p className="mt-2 text-sm text-zinc-400">
            No pudimos encontrar ningún número activo asociado a esta clave. Verifica que la dirección URL sea correcta o contacta a soporte.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to={localizedPath("/paid")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-lg"
            >
              Ver números disponibles
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const phone = rental.phone_numbers;
  const isExpired = secondsRemaining <= 0;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back navigation & guest badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={localizedPath("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
              <Crown className="h-3.5 w-3.5" />
              Acceso Directo Sin Registro
            </span>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Privado
            </span>
          </div>
        </div>

        {/* SECRET LINK BANNER (Crucial for guest users) */}
        <div className="mb-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-yellow-500/5 p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  Guarda este enlace para no perder tu número
                </h3>
                <p className="mt-0.5 text-xs text-zinc-300 leading-relaxed">
                  Como no te has registrado, <strong>esta URL es tu única llave de acceso privada</strong>. Añádela a favoritos o copia el enlace para volver cuando quieras.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md transition-all hover:from-amber-400 hover:to-yellow-400"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? "¡Enlace Copiado!" : "Copiar Enlace Secreto"}
            </button>
          </div>
        </div>

        {/* NUMBER CARD & LIVE TIMER */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Phone details */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800/90 p-2 shadow-inner">
                <PhoneCountryFlag phone={phone} className="h-10 w-8" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {phone.country_name}
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Activo
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider">
                    {phone.number}
                  </span>
                  <button
                    onClick={handleCopyNumber}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-emerald-500/40 hover:text-white"
                  >
                    {copiedNumber ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedNumber ? "¡Copiado!" : "Copiar Número"}
                  </button>
                </div>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-4 min-w-[220px]">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Tiempo Restante:</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className={`font-mono text-lg sm:text-xl font-black ${isExpired ? "text-red-400" : "text-amber-400"}`}>
                {formatCountdown(secondsRemaining)}
              </div>
              <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Vence: {formatDate(rental.expires_at)}
              </div>
            </div>
          </div>
        </div>

        {/* PRIVATE SMS INBOX */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Bandeja de SMS Privada
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                    {messages.length} recibidos
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Actualización automática en vivo cada 4 segundos
                </p>
              </div>
            </div>

            <button
              onClick={() => loadRentalData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
              Actualizar
            </button>
          </div>

          {/* Messages list or empty state */}
          {messages.length === 0 ? (
            <div className="py-16 text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                <span className="absolute h-full w-full rounded-2xl bg-emerald-500/10 animate-ping" />
                <MessageSquare className="h-7 w-7 text-emerald-400" />
              </div>
              <h4 className="mt-4 text-base font-bold text-white">Esperando mensajes SMS entrantes...</h4>
              <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
                Envía tu SMS de verificación (WhatsApp, Telegram, Google, etc.) al número <strong className="text-white font-mono">{phone.number}</strong> y aparecerá aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const code = extractCode(msg.message);

                return (
                  <div
                    key={msg.id}
                    className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-4 sm:p-5 transition-all hover:border-emerald-500/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300">
                          {msg.sender || "Servicio SMS"}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {timeAgo(msg.received_at, lang || "es")}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-zinc-500">
                        {formatDate(msg.received_at)}
                      </span>
                    </div>

                    {/* Message body */}
                    <div className="mt-3 text-sm text-zinc-200 leading-relaxed break-words font-sans">
                      {msg.message}
                    </div>

                    {/* Extracted Code Highlight */}
                    {code && (
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-medium text-emerald-300">Código de Verificación:</span>
                          <span className="font-mono text-base font-black text-white tracking-widest bg-zinc-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/40">
                            {code}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyCode(code, msg.id)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-zinc-950 transition-transform hover:scale-105 active:scale-95"
                        >
                          {copiedCodeId === msg.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedCodeId === msg.id ? "¡Copiado!" : "Copiar Código"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
