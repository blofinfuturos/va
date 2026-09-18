import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Smartphone, LayoutDashboard, Shield, LogIn, LogOut, User } from "lucide-react";
import { useLang } from "@/LanguageContext";
import { useAuth } from "@/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t, ta, localizedPath } = useLang();
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: t.nav.home, href: localizedPath("/") },
    { label: t.nav.freeNumbers, href: localizedPath("/free") },
    { label: t.nav.paidNumbers, href: localizedPath("/paid") },
    { label: t.nav.whyUs, href: localizedPath("/#why") },
    { label: t.nav.faq, href: localizedPath("/#faq") },
  ];

  const isActive = (href: string) => {
    const clean = href.split("#")[0];
    const currentClean = location.pathname;
    if (clean === localizedPath("/")) return currentClean === clean || currentClean === localizedPath("/");
    return currentClean.startsWith(clean);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={localizedPath("/")} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-white">SMSVerify</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">Receive SMS Online</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(item.href) ? "text-emerald-400" : "text-zinc-300 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Auth buttons - desktop */}
          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <Link
                  to={localizedPath("/dashboard")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(localizedPath("/dashboard")) ? "text-emerald-400" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {ta.nav.dashboard}
                </Link>
                {profile?.is_admin && (
                  <Link
                    to={localizedPath("/admin")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(localizedPath("/admin")) ? "text-amber-400" : "text-zinc-300 hover:text-amber-400"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    {ta.nav.admin}
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-red-500/30 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  {ta.nav.signOut}
                </button>
              </>
            ) : (
              <>
                <Link
                  to={localizedPath("/login")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                >
                  <LogIn className="h-4 w-4" />
                  {ta.nav.login}
                </Link>
                <Link
                  to={localizedPath("/register")}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
                >
                  <User className="h-4 w-4" />
                  {ta.nav.register}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 text-zinc-200 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href) ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-zinc-800" />
            {user ? (
              <>
                <Link
                  to={localizedPath("/dashboard")}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {ta.nav.dashboard}
                </Link>
                {profile?.is_admin && (
                  <Link
                    to={localizedPath("/admin")}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-amber-400"
                  >
                    <Shield className="h-4 w-4" />
                    {ta.nav.admin}
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  {ta.nav.signOut}
                </button>
              </>
            ) : (
              <>
                <Link
                  to={localizedPath("/login")}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                >
                  <LogIn className="h-4 w-4" />
                  {ta.nav.login}
                </Link>
                <Link
                  to={localizedPath("/register")}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-zinc-950"
                >
                  <User className="h-4 w-4" />
                  {ta.nav.register}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
