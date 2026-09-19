import { Link } from "react-router-dom";
import { Smartphone } from "lucide-react";
import { useLang } from "@/LanguageContext";

export function Footer() {
  const { t, localizedPath } = useLang();

  return (
    <footer className="w-full max-w-full overflow-hidden border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to={localizedPath("/")} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold text-white">GhostSMS</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">{t.footer.product}</h4>
            <ul className="mt-4 space-y-2.5">
              {t.footer.links.map((link, i) => (
                <li key={i}>
                  <Link
                    to={localizedPath(link.href)}
                    className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={localizedPath("/admin")}
                  className="text-xs text-zinc-600 transition-colors hover:text-amber-400"
                >
                  Panel de Administrador
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">{t.footer.legal}</h4>
            <ul className="mt-4 space-y-2.5">
              {t.footer.legalLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={localizedPath(link.href)}
                    className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800/60 pt-6">
          <p className="text-xs text-zinc-500">{t.footer.disclaimer}</p>
          <p className="mt-3 text-sm text-zinc-400">
            © {new Date().getFullYear()} GhostSMS. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
