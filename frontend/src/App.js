import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Solutions from "@/pages/Solutions";
import Kagayo from "@/pages/Kagayo";
import Partners from "@/pages/Partners";
import Leadership from "@/pages/Leadership";
import Careers from "@/pages/Careers";
import JobDetail from "@/pages/JobDetail";
import Insights from "@/pages/Insights";
import Contact from "@/pages/Contact";
import Quote from "@/pages/Quote";
import Book from "@/pages/Book";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/kagayo" element={<Kagayo />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/leadership" element={<Leadership />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/careers/:id" element={<JobDetail />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/insights/:slug" element={<Insights />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/quote" element={<Quote />} />
              <Route path="/book" element={<Book />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
          <Toaster theme="dark" position="bottom-right" toastOptions={{
            style: { background: "#0D0D10", border: "1px solid rgba(255,255,255,0.1)", color: "#FAFAFA" },
          }} />
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
