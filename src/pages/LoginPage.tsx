import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Smartphone, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/AuthContext";
import { useLang } from "@/LanguageContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const { ta, localizedPath } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = ta.auth.errorRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = ta.auth.errorEmail;
    if (!password) e.password = ta.auth.errorRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setSubmitError(error);
    } else {
      navigate(localizedPath("/dashboard"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-20 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to={localizedPath("/")} className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 p-8">
          <h1 className="text-2xl font-bold text-white">{ta.auth.loginTitle}</h1>
          <p className="mt-2 text-sm text-zinc-400">{ta.auth.loginSubtitle}</p>

          {submitError && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">{ta.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl border bg-zinc-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">{ta.auth.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border bg-zinc-900/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-white transition-all hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60"
            >
              {loading ? ta.auth.signingIn : ta.auth.signIn}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            <Link to={localizedPath("/register")} className="font-medium text-emerald-400 hover:text-emerald-300">
              {ta.auth.dontHaveAccount}
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            to={localizedPath("/")}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {ta.auth.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
