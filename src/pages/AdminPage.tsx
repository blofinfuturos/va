import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Phone, ShoppingBag, Plus, Pencil, Trash2, X, Check, AlertCircle, TrendingUp, Crown, Wallet, ShieldAlert } from "lucide-react";
import { useAuth } from "@/AuthContext";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";
import { CountryFlag } from "@/components/CountryFlag";
import { formatDate } from "@/utils";
import type { PhoneNumber } from "@/types";

type Profile = {
  id: string;
  email: string;
  is_admin: boolean;
  credits: number;
  created_at: string;
};

type Purchase = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  credits_purchased: number;
  status: string;
  created_at: string;
  phone_number_id: string | null;
};

type Tab = "overview" | "numbers" | "users" | "purchases";

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

export function AdminPage() {
  const { user, profile, loading } = useAuth();
  const { ta, localizedPath } = useLang();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("overview");
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NumberForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, activeRentals: 0, totalNumbers: 0 });

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      navigate(localizedPath("/"));
    }
  }, [user, profile, loading, navigate, localizedPath]);

  useEffect(() => {
    if (!user || !profile?.is_admin) return;
    (async () => {
      const [numsRes, usersRes, purchasesRes, rentalsRes] = await Promise.all([
        supabase.from("phone_numbers").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("purchases").select("*").order("created_at", { ascending: false }),
        supabase.from("premium_number_rentals").select("*").eq("status", "active"),
      ]);
      setNumbers((numsRes.data as PhoneNumber[]) || []);
      setUsers((usersRes.data as Profile[]) || []);
      setPurchases((purchasesRes.data as Purchase[]) || []);
      const completedPurchases = (purchasesRes.data as Purchase[]) || [];
      const revenue = completedPurchases
        .filter((p) => p.status === "completed" && p.type === "credits")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      setStats({
        totalUsers: (usersRes.data as Profile[])?.length ?? 0,
        totalRevenue: revenue,
        activeRentals: (rentalsRes.data as Purchase[])?.length ?? 0,
        totalNumbers: (numsRes.data as PhoneNumber[])?.length ?? 0,
      });
      setDataLoading(false);
    })();
  }, [user, profile]);

  const handleSaveNumber = async () => {
    if (!form.number || !form.country_code || !form.country_name) {
      setFormError(ta.admin.number + ", " + ta.admin.country + " — " + ta.auth.errorRequired);
      return;
    }
    setFormError(null);
    if (editingId) {
      await supabase
        .from("phone_numbers")
        .update({
          number: form.number,
          country_code: form.country_code.toLowerCase(),
          country_name: form.country_name,
          country_flag: form.country_flag || form.country_code.toLowerCase(),
          type: form.type,
          is_active: form.is_active,
        })
        .eq("id", editingId);
    } else {
      await supabase.from("phone_numbers").insert({
        number: form.number,
        country_code: form.country_code.toLowerCase(),
        country_name: form.country_name,
        country_flag: form.country_flag || form.country_code.toLowerCase(),
        type: form.type,
        is_active: form.is_active,
        received_count: 0,
      });
    }
    const { data: updated } = await supabase
      .from("phone_numbers")
      .select("*")
      .order("created_at", { ascending: false });
    setNumbers((updated as PhoneNumber[]) || []);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDeleteNumber = async (id: string) => {
    if (!confirm(ta.admin.confirmDelete)) return;
    await supabase.from("phone_numbers").delete().eq("id", id);
    setNumbers(numbers.filter((n) => n.id !== id));
  };

  const handleEditNumber = (n: PhoneNumber) => {
    setEditingId(n.id);
    setForm({
      number: n.number,
      country_code: n.country_code,
      country_name: n.country_name,
      country_flag: n.country_flag,
      type: n.type,
      is_active: n.is_active,
    });
    setShowForm(true);
  };

  const handleToggleAdmin = async (u: Profile) => {
    const { error } = await supabase.auth.admin.updateUserById(u.id, {
      app_metadata: { is_admin: !u.is_admin },
    });
    if (!error) {
      const { data: updatedUsers } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers((updatedUsers as Profile[]) || []);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <h1 className="mt-4 text-xl font-bold text-white">{ta.admin.accessDenied}</h1>
        <p className="mt-2 text-sm text-zinc-400">{ta.admin.accessDeniedDesc}</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: ta.admin.overview, icon: LayoutDashboard },
    { key: "numbers", label: ta.admin.manageNumbers, icon: Phone },
    { key: "users", label: ta.admin.manageUsers, icon: Users },
    { key: "purchases", label: ta.admin.managePurchases, icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{ta.admin.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{ta.admin.subtitle}</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === tb.key
                  ? "bg-emerald-500 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <tb.icon className="h-4 w-4" />
              {tb.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: ta.admin.totalUsers, value: stats.totalUsers, icon: Users, color: "blue" },
              { label: ta.admin.totalRevenue, value: `€${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "emerald" },
              { label: ta.admin.activeRentals, value: stats.activeRentals, icon: Crown, color: "amber" },
              { label: ta.admin.totalNumbers, value: stats.totalNumbers, icon: Phone, color: "teal" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20`}>
                  <s.icon className={`h-5 w-5 text-${s.color}-400`} />
                </div>
                <div className="mt-4 text-3xl font-bold text-white">{s.value}</div>
                <div className="mt-1 text-sm text-zinc-400">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "numbers" && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
                {ta.admin.addNumber}
              </button>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800/40" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/60">
                    <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                      <th className="px-4 py-3">{ta.admin.number}</th>
                      <th className="px-4 py-3">{ta.admin.country}</th>
                      <th className="px-4 py-3">{ta.admin.type}</th>
                      <th className="px-4 py-3">{ta.admin.status}</th>
                      <th className="px-4 py-3 text-right">{ta.admin.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {numbers.map((n) => (
                      <tr key={n.id} className="transition-colors hover:bg-zinc-900/40">
                        <td className="px-4 py-3 font-mono font-medium text-white">{n.number}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <CountryFlag countryCode={n.country_code} countryName={n.country_name} className="h-4 w-5" />
                            <span className="text-zinc-300">{n.country_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            n.type === "paid" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {n.type === "paid" ? ta.admin.paid : ta.admin.free}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 text-xs ${
                            n.is_active ? "text-emerald-400" : "text-zinc-500"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${n.is_active ? "bg-emerald-400" : "bg-zinc-600"}`} />
                            {n.is_active ? ta.admin.active : ta.admin.inactive}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditNumber(n)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60 text-zinc-400 transition-colors hover:text-emerald-400"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNumber(n.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60 text-zinc-400 transition-colors hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/60">
                <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">{ta.admin.email}</th>
                  <th className="px-4 py-3">{ta.admin.role}</th>
                  <th className="px-4 py-3">{ta.dashboard.credits}</th>
                  <th className="px-4 py-3">{ta.admin.date}</th>
                  <th className="px-4 py-3 text-right">{ta.admin.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-500">{ta.admin.noUsers}</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-zinc-900/40">
                      <td className="px-4 py-3 font-medium text-white">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.is_admin ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {u.is_admin ? ta.admin.admin : ta.admin.user}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                          {u.credits}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleAdmin(u)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            u.is_admin
                              ? "border border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:text-red-400"
                              : "border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          }`}
                        >
                          {u.is_admin ? ta.admin.removeAdmin : ta.admin.makeAdmin}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "purchases" && (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/60">
                <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">{ta.admin.userName}</th>
                  <th className="px-4 py-3">{ta.admin.type}</th>
                  <th className="px-4 py-3">{ta.admin.amount}</th>
                  <th className="px-4 py-3">{ta.admin.status}</th>
                  <th className="px-4 py-3">{ta.admin.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {purchases.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-500">{ta.admin.noPurchases}</td></tr>
                ) : (
                  purchases.map((p) => {
                    const userRecord = users.find((u) => u.id === p.user_id);
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-zinc-900/40">
                        <td className="px-4 py-3 font-medium text-white">{userRecord?.email ?? p.user_id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-zinc-300">
                          {p.type === "credits" ? `${p.credits_purchased} ${ta.credits.credits}` : ta.admin.paid}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">€{Number(p.amount).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs ${
                            p.status === "completed" ? "text-emerald-400" : "text-zinc-500"
                          }`}>
                            {p.status === "completed" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{formatDate(p.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Number form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">{editingId ? ta.admin.editNumber : ta.admin.addNumber}</h3>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">{ta.admin.number}</label>
                <input
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">{ta.admin.country}</label>
                  <input
                    value={form.country_name}
                    onChange={(e) => setForm({ ...form, country_name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Spain"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">ISO</label>
                  <input
                    value={form.country_code}
                    onChange={(e) => setForm({ ...form, country_code: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="es"
                    maxLength={3}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">{ta.admin.type}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "free" | "paid" })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="free">{ta.admin.free}</option>
                    <option value="paid">{ta.admin.paid}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">{ta.admin.status}</label>
                  <select
                    value={form.is_active ? "active" : "inactive"}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === "active" })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="active">{ta.admin.active}</option>
                    <option value="inactive">{ta.admin.inactive}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60"
              >
                {ta.admin.cancel}
              </button>
              <button
                onClick={handleSaveNumber}
                className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                {ta.admin.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
