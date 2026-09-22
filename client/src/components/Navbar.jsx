import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = "transition hover:text-white";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0f1f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/dashboard"
          className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent"
        >
          Booking App
        </Link>

        <div className="flex items-center gap-6 text-sm text-white/80">
          <Link to="/dashboard" className={linkClass}>
            Dashboard
          </Link>

          {/* Customer links */}
          {role === "customer" && (
            <>
              <Link to="/providers" className={linkClass}>
                Providers
              </Link>
              <Link to="/my-bookings" className={linkClass}>
                My Bookings
              </Link>
              <Link to="/game" className={linkClass}>
                Game
              </Link>
              <span className="font-semibold text-cyan-400">
                🪙 {user?.appCoins ?? 0}
              </span>
            </>
          )}

          {/* Provider links */}
          {role === "provider" && (
            <>
              <Link to="/provider" className={linkClass}>
                Provider Panel
              </Link>
              <Link to="/add-service" className={linkClass}>
                Add Service
              </Link>
            </>
          )}

          {/* Admin link */}
          {role === "admin" && (
            <Link to="/admin" className={linkClass}>
              Admin Panel
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/20 px-4 py-1.5 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}