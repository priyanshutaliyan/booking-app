import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const primaryBtn =
  "inline-block rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:opacity-90";
const secondaryBtn =
  "inline-block rounded-xl border border-white/20 px-6 py-3 font-semibold transition hover:bg-white/10";

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold">Welcome, {user?.name} 👋</h1>
          <p className="mt-2 capitalize text-white/60">Role: {role}</p>

          {/* Customer dashboard */}
          {role === "customer" && (
            <>
              <p className="mt-4 font-semibold text-cyan-400">
                🪙 App Coins: {user?.appCoins ?? 0}
              </p>
              <p className="mt-4 text-white/70">
                Book a service, track your bookings, and play the game to earn coins.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/providers" className={primaryBtn}>
                  Browse Services →
                </Link>
                <Link to="/my-bookings" className={secondaryBtn}>
                  My Bookings
                </Link>
                <Link to="/game" className={secondaryBtn}>
                  Play Game
                </Link>
              </div>
            </>
          )}

          {/* Provider dashboard */}
          {role === "provider" && (
            <>
              <p className="mt-4 text-white/70">
                Add your services and manage your bookings.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/provider" className={primaryBtn}>
                  Provider Panel →
                </Link>
                <Link to="/add-service" className={secondaryBtn}>
                  Add Service
                </Link>
              </div>
            </>
          )}

          {/* Admin dashboard */}
          {role === "admin" && (
            <>
              <p className="mt-4 text-white/70">
                Manage users and providers.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/admin" className={primaryBtn}>
                  Admin Panel →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}