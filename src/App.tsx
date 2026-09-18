import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider, useLang } from "@/LanguageContext";
import { AuthProvider } from "@/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomePage, FreeNumbersPage, PaidNumbersPage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AdminPage } from "@/pages/AdminPage";

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);
  return null;
}

function AppRoutes() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <ScrollToHash />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/es" replace />} />
          <Route path="/:lang" element={<HomePage />} />
          <Route path="/:lang/free" element={<FreeNumbersPage />} />
          <Route path="/:lang/paid" element={<PaidNumbersPage />} />
          <Route path="/:lang/login" element={<LoginPage />} />
          <Route path="/:lang/register" element={<RegisterPage />} />
          <Route path="/:lang/dashboard" element={<DashboardPage />} />
          <Route path="/:lang/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/es" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
