import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const bare = pathname.startsWith("/admin");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-800">
      <Navbar />
      <main id="main-content">{children}</main>
      {!bare && <Footer />}
      <CookieConsent />
    </div>
  );
}
