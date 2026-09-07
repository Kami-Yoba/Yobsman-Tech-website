import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const sessionId = new URLSearchParams(location.hash.slice(1)).get("session_id");
    if (!sessionId) {
      navigate("/login", { replace: true });
      return;
    }
    api.post("/auth/google/session", { session_id: sessionId })
      .then(({ data }) => {
        setUser(data);
        window.history.replaceState(null, "", window.location.pathname);
        navigate(data.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      })
      .catch(() => navigate("/login", { replace: true }));
  }, [location.hash, navigate, setUser]);

  return (
    <div data-testid="auth-callback" className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <Loader2 className="animate-spin text-zinc-500" size={28} />
    </div>
  );
}
