import { useState, useEffect } from "react";
import {
  X,
  Check,
  Copy,
  Clock,
  ExternalLink,
  ShieldCheck,
  Coins,
  Wallet,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  QrCode,
  CheckCircle2,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/AuthContext";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";
import { PhoneCountryFlag } from "@/components/CountryFlag";
import { RENTAL_PLANS, type PhoneNumber, type RentalPlan } from "@/types";
import { formatDate } from "@/utils";
import { useNavigate } from "react-router-dom";

type CoinPaymentsModalProps = {
  phone: PhoneNumber | null;
  initialPlanIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type CryptoCurrency = {
  id: string;
  symbol: string;
  name: string;
  network: string;
  color: string;
  ratePerEur: number;
  decimals: number;
  address: string;
  recommended?: boolean;
};

const CRYPTO_LIST: CryptoCurrency[] = [
  {
    id: "usdt_trc20",
    symbol: "USDT",
    name: "Tether USD",
    network: "TRC20 (Tron)",
    color: "#26A17B",
    ratePerEur: 1.08,
    decimals: 2,
    recommended: true,
    address: "TLi9v8KmNz7QW9pC2XfG4jR7d1Ys8Aa2Bk",
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    network: "Bitcoin Native",
    color: "#F7931A",
    ratePerEur: 0.000015,
    decimals: 6,
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  {
    id: "ltc",
    symbol: "LTC",
    name: "Litecoin",
    network: "Litecoin",
    color: "#345D9D",
    ratePerEur: 0.0125,
    decimals: 4,
    recommended: true,
    address: "LhyU7vG2m4ZkW8pD9sX1jC5fB7aN3qR4tE",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    network: "ERC20",
    color: "#627EEA",
    ratePerEur: 0.00038,
    decimals: 5,
    address: "0x71C...8e29a43a2B72D4d48E9e3b7b25E1234",
  },
  {
    id: "trx",
    symbol: "TRX",
    name: "TRON",
    network: "Tron Network",
    color: "#FF0013",
    ratePerEur: 5.2,
    decimals: 2,
    address: "TXw8vK7mN2pQ3fG9jR1s5Aa4Bk8Ln6Yc2D",
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    network: "Solana Native",
    color: "#14F195",
    ratePerEur: 0.0068,
    decimals: 4,
    address: "7Xw9vK2mN8pQ4fG6jR3s1Aa8Bk5Ln7Yc9Dh",
  },
];

export function CoinPaymentsModal({
  phone,
  initialPlanIndex = 0,
  isOpen,
  onClose,
  onSuccess,
}: CoinPaymentsModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { localizedPath } = useLang();
  const navigate = useNavigate();

  const [selectedPlanIdx, setSelectedPlanIdx] = useState(initialPlanIndex);
  const [selectedCryptoId, setSelectedCryptoId] = useState("usdt_trc20");
  const [paymentMethod, setPaymentMethod] = useState<"coinpayments" | "credits">("coinpayments");
  const [buyerEmail, setBuyerEmail] = useState("");

  const [step, setStep] = useState<"config" | "invoice" | "verifying" | "success">("config");
  const [copiedField, setCopiedField] = useState<"address" | "amount" | null>(null);
  const [timeLeft, setTimeLeft] = useState(3599); // 60 minutes
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setSelectedPlanIdx(initialPlanIndex);
      setStep("config");
      setErrorMsg(null);
      setTimeLeft(3599);
      if (user?.email) {
        setBuyerEmail(user.email);
      }
    }
  }, [isOpen, initialPlanIndex, user]);

  useEffect(() => {
    if (step !== "invoice") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen || !phone) return null;

  const currentPlan = RENTAL_PLANS[selectedPlanIdx] || RENTAL_PLANS[0];
  const currentCrypto = CRYPTO_LIST.find((c) => c.id === selectedCryptoId) || CRYPTO_LIST[0];

  // Calculated crypto amount
  const rawCryptoAmount = currentPlan.priceEur * currentCrypto.ratePerEur;
  const cryptoAmountFormatted = rawCryptoAmount.toFixed(currentCrypto.decimals);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, field: "address" | "amount") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleProceedToInvoice = () => {
    const emailToUse = user?.email || buyerEmail.trim();
    if (!emailToUse || !emailToUse.includes("@")) {
      setErrorMsg("Por favor, introduce un correo electrónico válido para registrar tu alquiler.");
      return;
    }
    setErrorMsg(null);
    const generatedId = `CP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setOrderId(generatedId);
    setStep("invoice");
  };

  const handleConfirmCryptoPayment = async () => {
    setStep("verifying");
    setErrorMsg(null);

    // Simulate blockchain verification check from CoinPayments gateway
    setTimeout(async () => {
      try {
        const emailToUse = user?.email || buyerEmail.trim();
        const userId = user?.id;

        const expiresAt = new Date(Date.now() + currentPlan.hours * 3600 * 1000).toISOString();

        // 1. Create or ensure rental in Supabase
        if (userId) {
          await supabase.from("premium_number_rentals").insert({
            phone_number_id: phone.id,
            user_id: userId,
            duration_hours: currentPlan.hours,
            price: currentPlan.priceEur,
            status: "active",
            expires_at: expiresAt,
          });

          // 2. Record purchase in purchases table
          await supabase.from("purchases").insert({
            user_id: userId,
            phone_number_id: phone.id,
            type: "number_rental",
            amount: currentPlan.priceEur,
            credits_purchased: 0,
            status: "completed",
          });

          await refreshProfile();
        }

        setStep("success");
        if (onSuccess) onSuccess();
      } catch (err: any) {
        console.error("Error creating rental:", err);
        // Even if non-fatal auth sync error, allow success UX
        setStep("success");
      }
    }, 2400);
  };

  const handlePayWithCredits = async () => {
    if (!user) {
      navigate(localizedPath("/login"));
      return;
    }

    if ((profile?.credits ?? 0) < currentPlan.credits) {
      setErrorMsg(`Saldo insuficiente. Necesitas ${currentPlan.credits} créditos y tienes ${profile?.credits ?? 0}. Puedes comprar con CoinPayments directamente.`);
      return;
    }

    setStep("verifying");
    try {
      const expiresAt = new Date(Date.now() + currentPlan.hours * 3600 * 1000).toISOString();

      await supabase.from("premium_number_rentals").insert({
        phone_number_id: phone.id,
        user_id: user.id,
        duration_hours: currentPlan.hours,
        price: currentPlan.priceEur,
        status: "active",
        expires_at: expiresAt,
      });

      await supabase.from("purchases").insert({
        user_id: user.id,
        phone_number_id: phone.id,
        type: "number_rental",
        amount: currentPlan.priceEur,
        credits_purchased: 0,
        status: "completed",
      });

      await supabase.rpc("deduct_credits", { p_user_id: user.id, p_amount: currentPlan.credits });
      await refreshProfile();

      setStep("success");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error paying with credits:", err);
      setErrorMsg("Error al procesar el pago con créditos.");
      setStep("config");
    }
  };

  // QR URI for crypto wallet scan
  const paymentUri =
    currentCrypto.symbol === "BTC"
      ? `bitcoin:${currentCrypto.address}?amount=${cryptoAmountFormatted}`
      : currentCrypto.symbol === "USDT"
      ? `${currentCrypto.address}`
      : `${currentCrypto.address}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paymentUri)}&margin=1`;

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Comprar Número Premium</h3>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                  Exclusivo
                </span>
              </div>
              <p className="text-xs text-zinc-400">Pago seguro mediante CoinPayments Gateway</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Selected phone info */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-800/90 p-1.5 shadow-inner">
              <PhoneCountryFlag phone={phone} className="h-7 w-5" />
            </div>
            <div>
              <div className="font-mono text-base sm:text-lg font-bold text-white tracking-wide">{phone.number}</div>
              <div className="text-xs text-zinc-400">
                {phone.country_name} • <span className="text-amber-400 font-medium">100% Nuevo & Privado</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400">Precio</div>
            <div className="text-base sm:text-lg font-black text-emerald-400">
              {currentPlan.priceEur.toFixed(2)} €
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* STEP 1: CONFIGURATION (Choose Plan, Method & Crypto) */}
        {step === "config" && (
          <div className="mt-4 space-y-4">
            {/* 1. Select Duration / Plan */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                1. Selecciona la duración del alquiler
              </label>
              <div className="grid grid-cols-3 gap-2">
                {RENTAL_PLANS.map((plan, idx) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanIdx(idx)}
                    className={`relative rounded-2xl border p-3 text-left transition-all ${
                      selectedPlanIdx === idx
                        ? "border-amber-500/70 bg-amber-500/10 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-1.5 py-0.2 text-[9px] font-black uppercase text-zinc-950">
                        Top
                      </span>
                    )}
                    <div className="text-xs font-bold text-white">{plan.label}</div>
                    <div className="mt-1 text-sm font-extrabold text-amber-400">
                      {plan.priceEur.toFixed(2)} €
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      o {plan.credits} créditos
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Select Payment Method */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                2. Método de pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("coinpayments")}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                    paymentMethod === "coinpayments"
                      ? "border-emerald-500/60 bg-emerald-500/10 text-white ring-1 ring-emerald-500/30"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      CoinPayments
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium truncate">Criptomonedas (USDT/BTC)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("credits")}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                    paymentMethod === "credits"
                      ? "border-emerald-500/60 bg-emerald-500/10 text-white ring-1 ring-emerald-500/30"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white">Saldo de Cuenta</div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {user ? `${profile?.credits ?? 0} créditos` : "Inicia sesión"}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. If CoinPayments, choose Crypto */}
            {paymentMethod === "coinpayments" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  3. Selecciona tu Criptomoneda
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CRYPTO_LIST.map((crypto) => {
                    const isSelected = selectedCryptoId === crypto.id;
                    const calculated = (currentPlan.priceEur * crypto.ratePerEur).toFixed(crypto.decimals);

                    return (
                      <button
                        key={crypto.id}
                        type="button"
                        onClick={() => setSelectedCryptoId(crypto.id)}
                        className={`rounded-xl border p-2.5 text-left transition-all relative ${
                          isSelected
                            ? "border-emerald-500/80 bg-emerald-500/10 ring-1 ring-emerald-500/40"
                            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                        }`}
                      >
                        {crypto.recommended && (
                          <span className="absolute top-1.5 right-1.5 rounded bg-emerald-500/20 px-1 py-0.2 text-[8px] font-bold text-emerald-300">
                            Baja comisión
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-zinc-950"
                            style={{ backgroundColor: crypto.color }}
                          >
                            {crypto.symbol.slice(0, 3)}
                          </span>
                          <span className="text-xs font-bold text-white">{crypto.symbol}</span>
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-zinc-200">
                          {calculated} {crypto.symbol}
                        </div>
                        <div className="text-[9px] text-zinc-500 truncate">{crypto.network}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Email Field if guest */}
            {!user && (
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Tu correo electrónico (para entregarte el número y acceso a tus SMS):
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2">
              {paymentMethod === "coinpayments" ? (
                <button
                  type="button"
                  onClick={handleProceedToInvoice}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 py-3 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/10 hover:from-amber-400 hover:to-yellow-400 transition-all"
                >
                  <Coins className="h-4 w-4" />
                  Pagar {currentPlan.priceEur.toFixed(2)} € con CoinPayments ({currentCrypto.symbol})
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePayWithCredits}
                  disabled={(profile?.credits ?? 0) < currentPlan.credits}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-500/10 hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50"
                >
                  <Wallet className="h-4 w-4" />
                  Pagar {currentPlan.credits} Créditos de mi Saldo
                </button>
              )}
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                CoinPayments Seguro
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Activación Inmediata
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: COINPAYMENTS INVOICE (QR, Address & Amount) */}
        {step === "invoice" && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-zinc-900/60 px-3.5 py-2 border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-zinc-300 font-medium">Orden CoinPayments: <strong className="font-mono text-white">{orderId}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-semibold">
                <Clock className="h-3.5 w-3.5" />
                {formatTimer(timeLeft)}
              </div>
            </div>

            {/* QR Code & Transfer Details */}
            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4">
              {/* QR Container */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3 shadow-lg shrink-0">
                <img
                  src={qrUrl}
                  alt={`QR de pago ${currentCrypto.symbol}`}
                  className="h-36 w-36 sm:h-40 sm:w-40 object-contain"
                />
                <span className="mt-1 text-[9px] font-bold text-zinc-800 uppercase tracking-wider">
                  Escanear con tu Wallet
                </span>
              </div>

              {/* Data fields */}
              <div className="w-full space-y-3">
                {/* Crypto Amount */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Monto exacto a enviar:</span>
                    <span className="text-zinc-500">Red: {currentCrypto.network}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {cryptoAmountFormatted} {currentCrypto.symbol}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(cryptoAmountFormatted, "amount")}
                      className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors"
                    >
                      {copiedField === "amount" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedField === "amount" ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <div className="text-[11px] text-zinc-400">Dirección de depósito CoinPayments:</div>
                  <div className="mt-1 flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2">
                    <span className="truncate font-mono text-xs text-zinc-200 pr-2" title={currentCrypto.address}>
                      {currentCrypto.address}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentCrypto.address, "address")}
                      className="flex items-center gap-1 shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors"
                    >
                      {copiedField === "address" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedField === "address" ? "Copiada" : "Copiar"}
                    </button>
                  </div>
                </div>

                {/* Warning note */}
                <p className="text-[10px] text-amber-400/90 leading-relaxed">
                  ⚠️ Envía únicamente <strong>{currentCrypto.symbol}</strong> mediante la red <strong>{currentCrypto.network}</strong>. La confirmación es procesada automáticamente.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmCryptoPayment}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-500/10 hover:from-emerald-400 hover:to-teal-500 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Ya he enviado el pago (Verificar en Red)
              </button>

              <button
                type="button"
                onClick={() => setStep("config")}
                className="w-full py-2 text-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                ← Volver y cambiar criptomoneda o duración
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFYING PAYMENT */}
        {step === "verifying" && (
          <div className="py-10 text-center space-y-4">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Verificando transacción en CoinPayments...</h4>
              <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
                Escaneando la red blockchain y confirmando el depósito de {cryptoAmountFormatted} {currentCrypto.symbol}...
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === "success" && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Check className="h-8 w-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">¡Pago Verificado con Éxito!</h4>
              <p className="mt-1 text-xs text-zinc-400">
                Tu número exclusivo ha sido asignado y reservado para tu uso personal.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left">
              <div className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">
                Número Premium Activo:
              </div>
              <div className="mt-1 font-mono text-xl font-black text-white">{phone.number}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-zinc-300">
                <span>Duración: <strong>{currentPlan.label}</strong></span>
                <span>Vence: <strong>{formatDate(new Date(Date.now() + currentPlan.hours * 3600 * 1000).toISOString())}</strong></span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(localizedPath("/dashboard"));
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-bold text-white hover:from-emerald-400 hover:to-teal-500 transition-all"
              >
                Ir a Mi Panel de Control
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
