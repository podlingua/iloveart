import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/supabase/AuthProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Dashboard from "@/pages/Dashboard";
import SessionPage from "@/pages/SessionPage";
import HistoryPage from "@/pages/HistoryPage";
import SaveProgressPage from "@/pages/SaveProgressPage";
import SignInPage from "@/pages/SignInPage";
import AccountPage from "@/pages/AccountPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/save-progress" element={<SaveProgressPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
