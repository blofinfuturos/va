import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  Crown,
  Wallet,
  ShieldAlert,
  Shield,
  Clock,
  Search,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Calendar,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Copy,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Smartphone,
  Lock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/AuthContext";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";
import { CountryFlag, PhoneCountryFlag } from "@/components/CountryFlag";
import { SmsModal } from "@/components/SmsModal";
import { formatDate, timeAgo } from "@/utils";
import type { PhoneNumber, Profile, Rental, Purchase, SmsMessage } from "@/types";

type Tab = "overview" | "rentals" | "numbers" | "users" | "sms" | "purchases";

type NumberForm = {
  number: string;
  country_code: string;
  country_name: string;
  country_flag: string;
  type: "free" | "paid";
  is_active: boolean;
};

const emptyForm: NumberForm = {
  number: "",
  country_code: "",
  country_name: "",
  country_flag: "",
  type: "paid",
  is_active: true,
};

function getRentalTiming(expiresAt: string, status: string) {
  if (status === "cancelled") {
    return { isExpired: true, isExpiringSoon: false, text: "Cancelado", color: "red" as const };
  }
  const now = Date.now();
  const exp = new Date(expiresAt).getTime();
  const diffMs = exp - now;

  if (diffMs <= 0 || status === "expired") {
    return { isExpired: true, isExpiringSoon: false, text: "Expirado", color: "zinc" as const };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const isExpiringSoon = diffHours < 24;

  let text = "";
  if (diffDays > 0) {
    const remHours = diffHours % 24;
    text = `Quedan ${diffDays}d ${remHours}h`;
  } else if (diffHours > 0) {
    text = `Quedan ${diffHours}h ${diffMinutes}m`;
  } else {
    text = `Quedan ${diffMinutes} min`;
  }

  return {
    isExpired: false,
    isExpiringSoon,
    text,
    color: isExpiringSoon ? ("amber" as const) : ("emerald" as const),
  };
}

export function AdminPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { ta, localizedPath, lang } = useLang();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("overview");
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [recentSms, setRecentSms] = useState<SmsMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals & form state
  const [showNumberModal, setShowNumberModal] = useState(false);
  const [editingNumberId, setEditingNumberId] = useState<string | null>(null);
  const [numberForm, setNumberForm] = useState<NumberForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  // SMS viewer modal
  const [smsModalPhone, setSmsModalPhone] = useState<PhoneNumber | null>(null);

  // Credits adjustment modal
  const [creditModalUser, setCreditModalUser] = useState<Profile | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(10);

  // Extend rental modal
  const [extendRentalItem, setExtendRentalItem] = useState<Rental | null>(null);
  const [extendHours, setExtendHours] = useState<number>(24);

  // Manual assign rental modal
  const [assignModalPhone, setAssignModalPhone] = useState<PhoneNumber | null>(null);
  const [assignUserId, setAssignUserId] = useState<string>("");
  const [assignHours, setAssignHours] = useState<number>(24);

  // Filters & search
  const [numberSearch, setNumberSearch] = useState("");
  const [numberFilter, setNumberFilter] = useState<"all" | "available" | "rented" | "free" | "paid">("all");

  const [rentalSearch, setRentalSearch] = useState("");
  const [rentalFilter, setRentalFilter] = useState<"all" | "active" | "expiring_soon" | "expired">("all");

  const [smsSearch, setSmsSearch] = useState("");

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [claimingAdmin, setClaimingAdmin] = useState(false);

  const showNotification = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      const [numsRes, usersRes, purchasesRes, rentalsRes, smsRes] = await Promise.all([
        supabase.from("phone_numbers").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("purchases").select("*").order("created_at", { ascending: false }),
        supabase.from("premium_number_rentals").select("*, phone_numbers(*)").order("created_at", { ascending: false }),
        supabase.from("sms_messages").select("*, phone_numbers(*)").order("received_at", { ascending: false }).limit(60),
      ]);

      setNumbers((numsRes.data as PhoneNumber[]) || []);
      setUsers((usersRes.data as Profile[]) || []);
      setPurchases((purchasesRes.data as Purchase[]) || []);
      setRentals((rentalsRes.data as Rental[]) || []);
      setRecentSms((smsRes.data as SmsMessage[]) || []);
    } catch (e) {
      console.error("Error loading admin data:", e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile?.is_admin) {
      loadAllData();
    }
  }, [user, profile?.is_admin]);

  // Handle claiming admin mode for owner/dev
  const handleClaimAdmin = async () => {
    if (!user) return;
    setClaimingAdmin(true);
    try {
      const { error } = await supabase.from("profiles").update({ is_admin: true }).eq("id", user.id);
      if (error) {
        showNotification("error", "Error al actualizar perfil: " + error.message);
      } else {
        await refreshProfile();
        showNotification("success", "¡Modo Administrador activado con éxito!");
      }
    } catch (err) {
      showNotification("error", "Error al activar permisos");
    } finally {
      setClaimingAdmin(false);
    }
  };

  // Map of currently active rental for each phone number
  const activeRentalsMap = useMemo(() => {
    const map = new Map<string, Rental>();
    const now = Date.now();
    rentals.forEach((r) => {
      if (r.status === "active" && new Date(r.expires_at).getTime() > now) {
        map.set(r.phone_number_id, r);
      }
    });
    return map;
  }, [rentals]);

  // User lookup map
  const userMap = useMemo(() => {
    const map = new Map<string, Profile>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Stats summary calculations
  const stats = useMemo(() => {
    const totalNumbers = numbers.length;
    const activeRentalsCount = activeRentalsMap.size;
    const freeNumbersCount = numbers.filter((n) => n.type === "free").length;
    const premiumNumbersCount = numbers.filter((n) => n.type === "paid").length;
    const availableNumbersCount = numbers.filter(
      (n) => n.is_active && !activeRentalsMap.has(n.id)
    ).length;

    const expiringSoonCount = Array.from(activeRentalsMap.values()).filter((r) => {
      const timing = getRentalTiming(r.expires_at, r.status);
      return timing.isExpiringSoon;
    }).length;

    const totalRevenue = purchases
      .filter((p) => p.status === "completed" && p.type === "credits")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalSmsCount = numbers.reduce((sum, n) => sum + (n.received_count || 0), 0);

    return {
      totalNumbers,
      activeRentalsCount,
      freeNumbersCount,
      premiumNumbersCount,
      availableNumbersCount,
      expiringSoonCount,
      totalUsers: users.length,
      totalRevenue,
      totalSmsCount,
    };
  }, [numbers, activeRentalsMap, purchases, users]);

  // Number saving (add or edit)
  const handleSaveNumber = async () => {
    if (!numberForm.number || !numberForm.country_code || !numberForm.country_name) {
      setFormError(ta.admin.number + ", " + ta.admin.country + " — " + ta.auth.errorRequired);
      return;
    }
    setFormError(null);

    const payload = {
      number: numberForm.number.trim(),
      country_code: numberForm.country_code.trim().toLowerCase(),
      country_name: numberForm.country_name.trim(),
      country_flag: numberForm.country_flag.trim() || numberForm.country_code.trim().toLowerCase(),
      type: numberForm.type,
      is_active: numberForm.is_active,
    };

    if (editingNumberId) {
      const { error } = await supabase.from("phone_numbers").update(payload).eq("id", editingNumberId);
      if (error) {
        setFormError(error.message);
        return;
      }
      showNotification("success", "Número actualizado correctamente");
    } else {
      const { error } = await supabase.from("phone_numbers").insert({
        ...payload,
        received_count: 0,
      });
      if (error) {
        setFormError(error.message);
        return;
      }
      showNotification("success", "Número creado correctamente");
    }

    setShowNumberModal(false);
    setEditingNumberId(null);
    setNumberForm(emptyForm);
    loadAllData();
  };

  const handleDeleteNumber = async (id: string) => {
    if (!confirm(ta.admin.confirmDelete)) return;
    const { error } = await supabase.from("phone_numbers").delete().eq("id", id);
    if (!error) {
      showNotification("success", "Número eliminado");
      loadAllData();
    } else {
      showNotification("error", error.message);
    }
  };

  const handleToggleNumberActive = async (phone: PhoneNumber) => {
    const { error } = await supabase
      .from("phone_numbers")
      .update({ is_active: !phone.is_active })
      .eq("id", phone.id);
    if (!error) {
      showNotification("success", phone.is_active ? "Número desactivado" : "Número activado");
      loadAllData();
    }
  };

  // Extend rental duration
  const handleConfirmExtendRental = async () => {
    if (!extendRentalItem) return;
    const currentExpiry = new Date(extendRentalItem.expires_at) > new Date()
      ? new Date(extendRentalItem.expires_at)
      : new Date();
    const newExpiry = new Date(currentExpiry.getTime() + extendHours * 3600000).toISOString();

    const { error } = await supabase
      .from("premium_number_rentals")
      .update({
        expires_at: newExpiry,
        status: "active",
        duration_hours: (extendRentalItem.duration_hours || 0) + extendHours,
      })
      .eq("id", extendRentalItem.id);

    if (!error) {
      showNotification("success", `Alquiler extendido en +${extendHours} horas`);
      setExtendRentalItem(null);
      loadAllData();
    } else {
      showNotification("error", error.message);
    }
  };

  // End / cancel rental immediately
  const handleTerminateRental = async (rentalId: string) => {
    if (!confirm("¿Deseas finalizar este alquiler y liberar el número inmediatamente para otros clientes?")) {
      return;
    }
    const { error } = await supabase
      .from("premium_number_rentals")
      .update({
        status: "expired",
        expires_at: new Date().toISOString(),
      })
      .eq("id", rentalId);

    if (!error) {
      showNotification("success", "Alquiler finalizado y número liberado");
      loadAllData();
    } else {
      showNotification("error", error.message);
    }
  };

  // Adjust user credits
  const handleConfirmAdjustCredits = async () => {
    if (!creditModalUser) return;
    const newCredits = Math.max(0, (creditModalUser.credits || 0) + creditAmount);
    const { error } = await supabase
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", creditModalUser.id);

    if (!error) {
      showNotification("success", `Saldo de ${creditModalUser.email} actualizado a ${newCredits} créditos`);
      setCreditModalUser(null);
      loadAllData();
    } else {
      showNotification("error", error.message);
    }
  };

  // Manually assign a number to a customer
  const handleConfirmAssignNumber = async () => {
    if (!assignModalPhone || !assignUserId) {
      alert("Selecciona un cliente válido");
      return;
    }
    const expiresAt = new Date(Date.now() + assignHours * 3600000).toISOString();

    const { error } = await supabase.from("premium_number_rentals").insert({
      phone_number_id: assignModalPhone.id,
      user_id: assignUserId,
      duration_hours: assignHours,
      price: 0,
      status: "active",
      expires_at: expiresAt,
    });

    if (!error) {
      showNotification("success", `Número ${assignModalPhone.number} asignado correctamente`);
      setAssignModalPhone(null);
      setAssignUserId("");
      loadAllData();
    } else {
      showNotification("error", error.message);
    }
  };

  // Filtered lists
  const filteredNumbers = useMemo(() => {
    const q = numberSearch.trim().toLowerCase();
    return numbers.filter((n) => {
      const isRented = activeRentalsMap.has(n.id);
      if (numberFilter === "available" && (!n.is_active || isRented)) return false;
      if (numberFilter === "rented" && !isRented) return false;
      if (numberFilter === "free" && n.type !== "free") return false;
      if (numberFilter === "paid" && n.type !== "paid") return false;

      if (!q) return true;
      const activeRental = activeRentalsMap.get(n.id);
      const client = activeRental ? userMap.get(activeRental.user_id) : null;
      const clientEmail = client?.email?.toLowerCase() || "";
      const userId = activeRental?.user_id?.toLowerCase() || "";

      return (
        n.number.toLowerCase().includes(q) ||
        n.country_name.toLowerCase().includes(q) ||
        n.country_code.toLowerCase().includes(q) ||
        clientEmail.includes(q) ||
        userId.includes(q)
      );
    });
  }, [numbers, numberSearch, numberFilter, activeRentalsMap, userMap]);

  const filteredRentals = useMemo(() => {
    const q = rentalSearch.trim().toLowerCase();
    return rentals.filter((r) => {
      const timing = getRentalTiming(r.expires_at, r.status);
      if (rentalFilter === "active" && (timing.isExpired || r.status !== "active")) return false;
      if (rentalFilter === "expiring_soon" && !timing.isExpiringSoon) return false;
      if (rentalFilter === "expired" && !timing.isExpired) return false;

      if (!q) return true;
      const phoneNum = r.phone_numbers?.number || "";
      const userEmail = userMap.get(r.user_id)?.email || "";
      return phoneNum.toLowerCase().includes(q) || userEmail.toLowerCase().includes(q);
    });
  }, [rentals, rentalSearch, rentalFilter, userMap]);

  const filteredSms = useMemo(() => {
    const q = smsSearch.trim().toLowerCase();
    if (!q) return recentSms;
    return recentSms.filter((s) => {
      const phoneNum = s.phone_numbers?.number || "";
      return (
        s.sender.toLowerCase().includes(q) ||
        s.message.toLowerCase().includes(q) ||
        phoneNum.toLowerCase().includes(q)
      );
    });
  }, [recentSms, smsSearch]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-20 pb-12">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <Lock className="h-7 w-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Debes iniciar sesión con tu cuenta para acceder a la gestión de números, alquileres y clientes.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to={localizedPath("/login")}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500"
              >
                Iniciar Sesión
              </Link>
              <Link
                to={localizedPath("/")}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but not admin yet
  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-20 pb-12">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
              <ShieldAlert className="h-7 w-7 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-white">{ta.admin.title}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              La cuenta conectada (<span className="font-semibold text-zinc-200">{user.email}</span>) no tiene permisos de administrador activos en la base de datos.
            </p>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                Habilitar Acceso Administrador
              </div>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Como dueño de la aplicación, puedes activar los permisos de administrador en 1 clic para entrar directamente al panel.
              </p>
              <button
                onClick={handleClaimAdmin}
                disabled={claimingAdmin}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
              >
                <Shield className="h-4 w-4" />
                {claimingAdmin ? "Activando..." : "Activar Modo Administrador"}
              </button>
            </div>

            <div className="mt-6">
              <Link to={localizedPath("/")} className="text-xs text-zinc-500 hover:text-zinc-300">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview" as const, label: ta.admin.overview, icon: LayoutDashboard },
    {
      key: "rentals" as const,
      label: ta.admin.manageRentals,
      icon: Clock,
      badge: stats.activeRentalsCount > 0 ? stats.activeRentalsCount : undefined,
      badgeColor: stats.expiringSoonCount > 0 ? "bg-amber-500 text-black" : "bg-emerald-500/20 text-emerald-400",
    },
    { key: "numbers" as const, label: ta.admin.manageNumbers, icon: Phone, badge: stats.totalNumbers },
    { key: "users" as const, label: ta.admin.manageUsers, icon: Users, badge: stats.totalUsers },
    { key: "sms" as const, label: ta.admin.smsInbox, icon: MessageSquare, badge: recentSms.length },
    { key: "purchases" as const, label: ta.admin.managePurchases, icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Floating feedback toast */}
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

        {/* Top Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Shield className="h-3.5 w-3.5" />
                Panel de Control de Administrador
              </span>
              <span className="text-xs text-zinc-500">Conectado como {user.email}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Gestión Global de Números y Clientes</h1>
            <p className="text-sm text-zinc-400">
              Controla inventario de números, qué cliente los tiene alquilados, vencimientos en tiempo real y mensajes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              disabled={dataLoading}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-50"
              title="Refrescar datos"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button
              onClick={() => {
                setNumberForm(emptyForm);
                setEditingNumberId(null);
                setShowNumberModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              Nuevo Número
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-1.5 scrollbar-thin">
          {tabs.map((tb) => {
            const Icon = tb.icon;
            const isActive = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tb.label}</span>
                {tb.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-zinc-950 text-white" : tb.badgeColor || "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {tb.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-900/30 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Números</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10">
                    <Phone className="h-4 w-4 text-teal-400" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-bold text-white">{stats.totalNumbers}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                  <span className="text-emerald-400 font-medium">{stats.availableNumbersCount} disponibles</span>
                  <span>·</span>
                  <span>{stats.freeNumbersCount} gratis</span>
                  <span>·</span>
                  <span>{stats.premiumNumbersCount} premium</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-900/30 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Alquileres Activos</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                    <Crown className="h-4 w-4 text-amber-400" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-bold text-white">{stats.activeRentalsCount}</div>
                <div className="mt-2 text-xs text-zinc-500">
                  {stats.expiringSoonCount > 0 ? (
                    <span className="text-amber-400 font-semibold">⚠️ {stats.expiringSoonCount} expiran en &lt;24h</span>
                  ) : (
                    <span className="text-zinc-400">Todos al día</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-900/30 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Clientes Registrados</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-bold text-white">{stats.totalUsers}</div>
                <div className="mt-2 text-xs text-zinc-500">Usuarios con cuentas activas</div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-900/30 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Ingresos Totales</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-bold text-white">€{stats.totalRevenue.toFixed(2)}</div>
                <div className="mt-2 text-xs text-emerald-400 font-medium">{stats.totalSmsCount} SMS procesados</div>
              </div>
            </div>

            {/* Quick alert: Expiring Soon Rentals */}
            {stats.expiringSoonCount > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold text-white">Atención: {stats.expiringSoonCount} alquiler(es) finalizan en menos de 24 horas</h3>
                </div>
                <p className="mt-1 text-xs text-zinc-300">
                  Los siguientes números están cerca de finalizar. Puedes extender su duración o dejar que expiren para que vuelvan a estar libres.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from(activeRentalsMap.values())
                    .filter((r) => getRentalTiming(r.expires_at, r.status).isExpiringSoon)
                    .map((r) => {
                      const client = userMap.get(r.user_id);
                      const timing = getRentalTiming(r.expires_at, r.status);
                      return (
                        <div key={r.id} className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-zinc-950/70 p-3">
                          <div>
                            <div className="font-mono text-sm font-bold text-white">{r.phone_numbers?.number}</div>
                            <div className="text-xs text-zinc-400 truncate max-w-[180px]">{client?.email || r.user_id.slice(0, 8)}</div>
                            <div className="mt-1 text-xs font-semibold text-amber-400">{timing.text}</div>
                          </div>
                          <button
                            onClick={() => setExtendRentalItem(r)}
                            className="rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
                          >
                            Extender
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Two column layout: Active Rentals summary & Recent SMS */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Active Rentals Quick Box */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-400" />
                    <h2 className="font-bold text-white">Alquileres Activos Recientes</h2>
                  </div>
                  <button
                    onClick={() => setTab("rentals")}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Ver todos ({activeRentalsMap.size}) <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {activeRentalsMap.size === 0 ? (
                  <div className="py-12 text-center text-sm text-zinc-500">
                    No hay ningún número alquilado en este momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(activeRentalsMap.values())
                      .slice(0, 4)
                      .map((rental) => {
                        const timing = getRentalTiming(rental.expires_at, rental.status);
                        const client = userMap.get(rental.user_id);
                        return (
                          <div
                            key={rental.id}
                            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5"
                          >
                            <div className="flex items-center gap-3">
                              {rental.phone_numbers && (
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 p-1">
                                  <PhoneCountryFlag phone={rental.phone_numbers} className="h-5 w-4" />
                                </div>
                              )}
                              <div>
                                <div className="font-mono text-sm font-bold text-white">
                                  {rental.phone_numbers?.number}
                                </div>
                                <div className="text-xs text-zinc-400">
                                  Cliente: <span className="text-zinc-200">{client?.email || rental.user_id.slice(0, 8)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  timing.isExpiringSoon
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-emerald-500/10 text-emerald-400"
                                }`}
                              >
                                {timing.text}
                              </span>
                              <div className="mt-0.5 text-[11px] text-zinc-500">
                                Finaliza: {formatDate(rental.expires_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Recent SMS Inbox Quick Box */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                    <h2 className="font-bold text-white">Últimos SMS Recibidos</h2>
                  </div>
                  <button
                    onClick={() => setTab("sms")}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Ver bandeja completa <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {recentSms.length === 0 ? (
                  <div className="py-12 text-center text-sm text-zinc-500">No hay mensajes recibidos aún.</div>
                ) : (
                  <div className="space-y-3">
                    {recentSms.slice(0, 4).map((msg) => (
                      <div
                        key={msg.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                              {msg.sender}
                            </span>
                            <span className="font-mono text-xs text-zinc-400">
                              → {msg.phone_numbers?.number || "Número"}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500">{timeAgo(msg.received_at, lang)}</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-300 line-clamp-2">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RENTALS (DETALLADO: CLIENTES, CUANDO FINALIZAN, ACCIONES) */}
        {tab === "rentals" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: "all" as const, label: "Todos los alquileres" },
                  { key: "active" as const, label: `Activos (${stats.activeRentalsCount})` },
                  { key: "expiring_soon" as const, label: `Por expirar (${stats.expiringSoonCount})` },
                  { key: "expired" as const, label: "Histórico / Expirados" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRentalFilter(f.key)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      rentalFilter === f.key
                        ? "bg-emerald-500 text-zinc-950"
                        : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={rentalSearch}
                  onChange={(e) => setRentalSearch(e.target.value)}
                  placeholder="Buscar por número o email..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </div>

            {filteredRentals.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
                <Crown className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-3 text-sm font-medium text-zinc-300">No se encontraron alquileres</p>
                <p className="mt-1 text-xs text-zinc-500">Prueba ajustando los filtros o el buscador.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Número Telefónico</th>
                      <th className="px-4 py-3.5">Cliente (Usuario)</th>
                      <th className="px-4 py-3.5">Plan / Duración</th>
                      <th className="px-4 py-3.5">Fecha Inicio</th>
                      <th className="px-4 py-3.5">Vencimiento / Cuenta Regresiva</th>
                      <th className="px-4 py-3.5">Estado</th>
                      <th className="px-4 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredRentals.map((rental) => {
                      const timing = getRentalTiming(rental.expires_at, rental.status);
                      const client = userMap.get(rental.user_id);
                      const phone = rental.phone_numbers;

                      return (
                        <tr key={rental.id} className="transition-colors hover:bg-zinc-900/50">
                          {/* Number */}
                          <td className="px-4 py-3.5 font-medium text-white">
                            <div className="flex items-center gap-2.5">
                              {phone && (
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 p-0.5">
                                  <PhoneCountryFlag phone={phone} className="h-4 w-3.5" />
                                </div>
                              )}
                              <div>
                                <span className="font-mono font-bold text-white text-sm">{phone?.number ?? "—"}</span>
                                <div className="text-[11px] text-zinc-500">{phone?.country_name}</div>
                              </div>
                            </div>
                          </td>

                          {/* Client */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                                {client?.email?.charAt(0).toUpperCase() ?? "U"}
                              </div>
                              <div>
                                <div className="font-medium text-white">{client?.email ?? rental.user_id}</div>
                                <div className="text-[11px] text-zinc-500">Saldo: {client?.credits ?? 0} créditos</div>
                              </div>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-3.5 text-zinc-300">
                            <div>{rental.duration_hours} horas ({Math.round(rental.duration_hours / 24)} días)</div>
                            <div className="text-[11px] text-zinc-500">{rental.price} créditos pagados</div>
                          </td>

                          {/* Started */}
                          <td className="px-4 py-3.5 text-zinc-400">
                            {formatDate(rental.created_at)}
                          </td>

                          {/* Expiration */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-white">{formatDate(rental.expires_at)}</div>
                            <div
                              className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${
                                timing.isExpired
                                  ? "text-zinc-500"
                                  : timing.isExpiringSoon
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {timing.text}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                rental.status === "active" && !timing.isExpired
                                  ? timing.isExpiringSoon
                                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  rental.status === "active" && !timing.isExpired
                                    ? timing.isExpiringSoon
                                      ? "bg-amber-400 animate-pulse"
                                      : "bg-emerald-400"
                                    : "bg-zinc-500"
                                }`}
                              />
                              {rental.status === "active" && !timing.isExpired
                                ? timing.isExpiringSoon
                                  ? "Expira pronto"
                                  : "Activo"
                                : rental.status === "cancelled"
                                ? "Cancelado"
                                : "Expirado"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {phone && (
                                <button
                                  onClick={() => setSmsModalPhone(phone)}
                                  className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-400"
                                  title="Ver SMS recibidos"
                                >
                                  SMS
                                </button>
                              )}
                              <button
                                onClick={() => setExtendRentalItem(rental)}
                                className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-amber-500/40 hover:text-amber-400"
                                title="Extender plazo de alquiler"
                              >
                                +Tiempo
                              </button>
                              {rental.status === "active" && !timing.isExpired && (
                                <button
                                  onClick={() => handleTerminateRental(rental.id)}
                                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                                  title="Liberar número ahora"
                                >
                                  Liberar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NUMBERS (INVENTARIO COMPLETO, ESTADO DE ALQUILER Y ACCIONES) */}
        {tab === "numbers" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: "all" as const, label: `Todos (${numbers.length})` },
                  { key: "available" as const, label: `Disponibles (${stats.availableNumbersCount})` },
                  { key: "rented" as const, label: `Alquilados (${stats.activeRentalsCount})` },
                  { key: "free" as const, label: `Gratis (${stats.freeNumbersCount})` },
                  { key: "paid" as const, label: `Premium (${stats.premiumNumbersCount})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setNumberFilter(f.key)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      numberFilter === f.key
                        ? "bg-emerald-500 text-zinc-950"
                        : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={numberSearch}
                  onChange={(e) => setNumberSearch(e.target.value)}
                  placeholder="Buscar por número, país o email de cliente..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </div>

            {filteredNumbers.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
                <Phone className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-3 text-sm font-medium text-zinc-300">No se encontraron números</p>
                <p className="mt-1 text-xs text-zinc-500">Ajusta los filtros o añade un nuevo número al catálogo.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Número Telefónico</th>
                      <th className="px-4 py-3.5">País</th>
                      <th className="px-4 py-3.5">Tipo</th>
                      <th className="px-4 py-3.5 text-zinc-200">Usuario Asignado</th>
                      <th className="px-4 py-3.5 text-zinc-200">Tiempo Restante</th>
                      <th className="px-4 py-3.5">Operativo</th>
                      <th className="px-4 py-3.5">SMS</th>
                      <th className="px-4 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredNumbers.map((num) => {
                      const activeRental = activeRentalsMap.get(num.id);
                      const client = activeRental ? userMap.get(activeRental.user_id) : null;
                      const timing = activeRental ? getRentalTiming(activeRental.expires_at, activeRental.status) : null;

                      return (
                        <tr key={num.id} className="transition-colors hover:bg-zinc-900/50">
                          {/* Phone number */}
                          <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                            <div className="font-mono text-sm font-bold text-white">{num.number}</div>
                            <div className="text-[11px] text-zinc-500">ID: {num.id.slice(0, 8)}</div>
                          </td>

                          {/* Country */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <CountryFlag countryCode={num.country_code} countryName={num.country_name} className="h-4 w-5" />
                              <span className="text-zinc-200 font-medium">{num.country_name}</span>
                              <span className="uppercase text-[10px] text-zinc-500 font-mono">({num.country_code})</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                num.type === "paid"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {num.type === "paid" ? "Premium" : "Gratis"}
                            </span>
                          </td>

                          {/* Usuario asignado */}
                          <td className="px-4 py-3.5 min-w-[210px]">
                            {activeRental ? (
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
                                  <Crown className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="truncate font-semibold text-white text-xs max-w-[170px]"
                                      title={client?.email || activeRental.user_id}
                                    >
                                      {client?.email || "Cliente sin email"}
                                    </span>
                                    {client?.email && (
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(client.email);
                                          showNotification("success", "Email copiado al portapapeles");
                                        }}
                                        className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5"
                                        title="Copiar email del cliente"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                                    <span className="text-emerald-400 font-mono font-medium">{client?.credits ?? 0} cr</span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="font-mono text-[10px] text-zinc-500">ID: {activeRental.user_id.slice(0, 8)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : num.type === "paid" ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Libre / Sin asignar
                                </span>
                                <button
                                  onClick={() => {
                                    setAssignModalPhone(num);
                                    setAssignUserId(users[0]?.id || "");
                                  }}
                                  className="text-[11px] text-zinc-400 hover:text-amber-400 underline underline-offset-2 transition-colors"
                                  title="Asignar manualmente a un cliente"
                                >
                                  Asignar
                                </button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400">
                                Público / Compartido
                              </span>
                            )}
                          </td>

                          {/* Tiempo restante */}
                          <td className="px-4 py-3.5 min-w-[190px] whitespace-nowrap">
                            {activeRental ? (
                              <div>
                                <div className="inline-flex items-center gap-1.5">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                      timing?.isExpiringSoon
                                        ? "border border-amber-500/30 bg-amber-500/15 text-amber-300 animate-pulse"
                                        : timing?.isExpired
                                        ? "border border-zinc-700 bg-zinc-800 text-zinc-400"
                                        : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                                    }`}
                                  >
                                    <Clock className="h-3 w-3" />
                                    {timing?.text}
                                  </span>
                                  {timing?.isExpiringSoon && (
                                    <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[10px] font-bold text-amber-400">
                                      Vence hoy
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
                                  <Calendar className="h-3 w-3 text-zinc-500" />
                                  <span>Hasta {formatDate(activeRental.expires_at)}</span>
                                </div>
                              </div>
                            ) : num.type === "paid" ? (
                              <span className="text-xs text-zinc-500 italic">Sin alquiler</span>
                            ) : (
                              <span className="text-xs text-zinc-500">Ilimitado</span>
                            )}
                          </td>

                          {/* Active / Inactive Toggle */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleNumberActive(num)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                                num.is_active
                                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                              }`}
                              title="Clic para pausar o reactivar número"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${num.is_active ? "bg-emerald-400" : "bg-zinc-500"}`} />
                              {num.is_active ? "Activo" : "Pausado"}
                            </button>
                          </td>

                          {/* SMS Received */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-white">{num.received_count || 0} SMS</span>
                            <div className="text-[11px] text-zinc-500">
                              {num.last_sms_at ? timeAgo(num.last_sms_at, lang) : "Sin mensajes"}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSmsModalPhone(num)}
                                className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-xs font-semibold text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-400"
                                title="Ver mensajes recibidos"
                              >
                                SMS
                              </button>

                              {activeRental ? (
                                <>
                                  <button
                                    onClick={() => setExtendRentalItem(activeRental)}
                                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
                                    title="Extender tiempo de alquiler"
                                  >
                                    +Tiempo
                                  </button>
                                  <button
                                    onClick={() => handleTerminateRental(activeRental.id)}
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                                    title="Finalizar alquiler y liberar número"
                                  >
                                    Liberar
                                  </button>
                                </>
                              ) : (
                                num.type === "paid" && (
                                  <button
                                    onClick={() => {
                                      setAssignModalPhone(num);
                                      setAssignUserId(users[0]?.id || "");
                                    }}
                                    className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-xs font-semibold text-amber-300 hover:border-amber-500/40"
                                    title="Asignar manualmente a un cliente"
                                  >
                                    Asignar
                                  </button>
                                )
                              )}

                              <button
                                onClick={() => {
                                  setEditingNumberId(num.id);
                                  setNumberForm({
                                    number: num.number,
                                    country_code: num.country_code,
                                    country_name: num.country_name,
                                    country_flag: num.country_flag,
                                    type: num.type,
                                    is_active: num.is_active,
                                  });
                                  setShowNumberModal(true);
                                }}
                                className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-1.5 text-zinc-400 hover:text-emerald-400"
                                title="Editar datos del número"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteNumber(num.id)}
                                className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-1.5 text-zinc-400 hover:text-red-400"
                                title="Eliminar número"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS / CLIENTS */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Cliente (Email)</th>
                    <th className="px-4 py-3.5">Rol</th>
                    <th className="px-4 py-3.5">Saldo Créditos</th>
                    <th className="px-4 py-3.5">Alquileres Activos</th>
                    <th className="px-4 py-3.5">Fecha Registro</th>
                    <th className="px-4 py-3.5 text-right">Acciones Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users.map((u) => {
                    const userActiveRentals = rentals.filter(
                      (r) => r.user_id === u.id && r.status === "active" && new Date(r.expires_at) > new Date()
                    );

                    return (
                      <tr key={u.id} className="transition-colors hover:bg-zinc-900/50">
                        {/* Email */}
                        <td className="px-4 py-3.5 font-medium text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">{u.email}</div>
                              <div className="text-[11px] font-mono text-zinc-500">ID: {u.id.slice(0, 10)}...</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              u.is_admin
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {u.is_admin && <Shield className="h-3 w-3" />}
                            {u.is_admin ? "Administrador" : "Cliente"}
                          </span>
                        </td>

                        {/* Credits */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
                            <Wallet className="h-4 w-4" />
                            {u.credits || 0} créditos
                          </div>
                        </td>

                        {/* Active Rentals list for this client */}
                        <td className="px-4 py-3.5">
                          {userActiveRentals.length === 0 ? (
                            <span className="text-zinc-500">Sin alquileres activos</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {userActiveRentals.map((ar) => (
                                <span
                                  key={ar.id}
                                  className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-200"
                                >
                                  {ar.phone_numbers?.number || "Número"}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-zinc-400">{formatDate(u.created_at)}</td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setCreditModalUser(u);
                                setCreditAmount(10);
                              }}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                            >
                              + Créditos
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SMS INBOX */}
        {tab === "sms" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-white text-base">Bandeja de Mensajes en Vivo</h2>
                <p className="text-xs text-zinc-400">Todos los SMS recibidos a través de la plataforma.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={smsSearch}
                  onChange={(e) => setSmsSearch(e.target.value)}
                  placeholder="Filtrar por remitente, texto o número..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </div>

            {filteredSms.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-3 text-sm text-zinc-400">No hay mensajes que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredSms.map((s) => (
                  <div
                    key={s.id}
                    className="group rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-4 transition-all hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                          {s.sender}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          → {s.phone_numbers?.number || "Número"}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{timeAgo(s.received_at, lang)}</span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-zinc-300 font-sans">{s.message}</p>

                    <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[11px] text-zinc-500">
                      <span>{formatDate(s.received_at)}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(s.message);
                          showNotification("success", "Mensaje copiado");
                        }}
                        className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400"
                      >
                        <Copy className="h-3 w-3" /> Copiar texto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PURCHASES & REVENUE */}
        {tab === "purchases" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Cliente</th>
                    <th className="px-4 py-3.5">Tipo de Compra</th>
                    <th className="px-4 py-3.5">Importe (€)</th>
                    <th className="px-4 py-3.5">Créditos</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        No hay compras registradas aún.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => {
                      const client = userMap.get(p.user_id);
                      return (
                        <tr key={p.id} className="transition-colors hover:bg-zinc-900/50">
                          <td className="px-4 py-3.5 font-medium text-white">{client?.email ?? p.user_id.slice(0, 8)}</td>
                          <td className="px-4 py-3.5 text-zinc-300">
                            {p.type === "credits" ? "Recarga de Créditos" : "Alquiler de Número"}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-white">€{Number(p.amount).toFixed(2)}</td>
                          <td className="px-4 py-3.5 text-emerald-400 font-semibold">{p.credits_purchased || "—"}</td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                p.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              {p.status === "completed" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-400">{formatDate(p.created_at)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD / EDIT PHONE NUMBER */}
        {showNumberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNumberModal(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white">{editingNumberId ? "Editar Número" : "Añadir Nuevo Número"}</h3>
              <p className="mt-1 text-xs text-zinc-400">Configura el número telefónico y país de origen.</p>

              {formError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Número (Formato Internacional)</label>
                  <input
                    value={numberForm.number}
                    onChange={(e) => setNumberForm({ ...numberForm, number: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-4 text-sm font-mono text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                    placeholder="+34 612 345 678"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-300">País</label>
                    <input
                      value={numberForm.country_name}
                      onChange={(e) => setNumberForm({ ...numberForm, country_name: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                      placeholder="España"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Código ISO (2 letras)</label>
                    <input
                      value={numberForm.country_code}
                      onChange={(e) => setNumberForm({ ...numberForm, country_code: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-3 text-sm uppercase font-mono text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                      placeholder="es"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Tipo de Acceso</label>
                    <select
                      value={numberForm.type}
                      onChange={(e) => setNumberForm({ ...numberForm, type: e.target.value as "free" | "paid" })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-3 text-xs text-white focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value="paid">Premium (Alquilable)</option>
                      <option value="free">Gratuito (Público)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Estado</label>
                    <select
                      value={numberForm.is_active ? "active" : "inactive"}
                      onChange={(e) => setNumberForm({ ...numberForm, is_active: e.target.value === "active" })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-3 text-xs text-white focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value="active">Activo (Disponible)</option>
                      <option value="inactive">Pausado (Inactivo)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowNumberModal(false)}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700/60"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNumber}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
                >
                  Guardar Número
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: EXTEND RENTAL DURATION */}
        {extendRentalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setExtendRentalItem(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white">Extender Plazo de Alquiler</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Añadir tiempo extra al número <span className="font-mono text-emerald-400">{extendRentalItem.phone_numbers?.number}</span>
              </p>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-xs">
                <div className="text-zinc-400">Cliente: <span className="text-white font-medium">{userMap.get(extendRentalItem.user_id)?.email}</span></div>
                <div className="mt-1 text-zinc-400">Vencimiento actual: <span className="text-white font-medium">{formatDate(extendRentalItem.expires_at)}</span></div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold text-zinc-300">Seleccionar Tiempo a Añadir</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { hours: 24, label: "+24 Horas" },
                    { hours: 168, label: "+7 Días" },
                    { hours: 720, label: "+30 Días" },
                  ].map((btn) => (
                    <button
                      key={btn.hours}
                      onClick={() => setExtendHours(btn.hours)}
                      className={`rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                        extendHours === btn.hours
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setExtendRentalItem(null)}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmExtendRental}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: ADJUST USER CREDITS */}
        {creditModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setCreditModalUser(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white">Gestionar Créditos de Cliente</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Ajustar saldo para <span className="font-semibold text-white">{creditModalUser.email}</span>
              </p>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-xs">
                Saldo actual: <span className="font-bold text-emerald-400 text-sm">{creditModalUser.credits || 0} créditos</span>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold text-zinc-300">Créditos a agregar o restar</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 25, 50].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCreditAmount(amt)}
                      className={`rounded-xl border p-2 text-xs font-semibold transition-all ${
                        creditAmount === amt
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 px-3 text-xs text-white"
                  placeholder="Cantidad manual (ej. 20 o -10)"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setCreditModalUser(null)}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAdjustCredits}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
                >
                  Actualizar Saldo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: MANUALLY ASSIGN NUMBER TO CUSTOMER */}
        {assignModalPhone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setAssignModalPhone(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white">Asignar Número a Cliente</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Asignar <span className="font-mono text-emerald-400">{assignModalPhone.number}</span> directamente.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Cliente de destino</label>
                  <select
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 px-3 text-xs text-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} ({u.credits || 0} créditos)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Duración del alquiler</label>
                  <select
                    value={assignHours}
                    onChange={(e) => setAssignHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 px-3 text-xs text-white"
                  >
                    <option value={24}>24 horas (1 día)</option>
                    <option value={168}>7 días (1 semana)</option>
                    <option value={720}>30 días (1 mes)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setAssignModalPhone(null)}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAssignNumber}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
                >
                  Asignar Número
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: SMS VIEWER */}
        <SmsModal phone={smsModalPhone} onClose={() => setSmsModalPhone(null)} />
      </div>
    </div>
  );
}
