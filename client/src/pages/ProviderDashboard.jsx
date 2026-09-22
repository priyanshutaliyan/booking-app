import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const statusStyle = {
  pending: "bg-yellow-500/15 text-yellow-300",
  confirmed: "bg-blue-500/15 text-blue-300",
  "in-progress": "bg-purple-500/15 text-purple-300",
  completed: "bg-green-500/15 text-green-300",
  cancelled: "bg-red-500/15 text-red-300",
};

const nextAction = {
  pending: { label: "Accept", status: "confirmed" },
  confirmed: { label: "Start", status: "in-progress" },
  "in-progress": { label: "Complete", status: "completed" },
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [profiles, setProfiles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const profRes = await api.get(`/providers/user/${userId}`);
      setProfiles(profRes.data);

      const results = await Promise.all(
        profRes.data.map((p) => api.get(`/bookings/provider/${p._id}`))
      );
      const all = results
        .flatMap((r) => r.data)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(all);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadData();
  }, [userId]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update the status.");
    }
  };

  const serviceName = (providerId) =>
    profiles.find((p) => p._id === providerId)?.serviceName || "Service";

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold">Provider Panel</h1>
        <p className="mt-1 text-sm text-white/50">Manage the bookings for your services</p>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-white/60">Loading...</p>
        ) : profiles.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/70">
              You haven't added any services yet.
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/70">No bookings yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    {serviceName(b.providerId)}
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    👤 {b.customerId?.name || "Customer"}
                    {b.customerId?.phone ? ` • ${b.customerId.phone}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    📅 {b.slotDate} • ⏰ {b.slotTime}
                  </p>
                  {b.address && (
                    <p className="mt-1 text-sm text-white/50">📍 {b.address}</p>
                  )}
                  <p className="mt-1 text-sm text-cyan-300">₹{b.price}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                      statusStyle[b.status] || "bg-white/10 text-white"
                    }`}
                  >
                    {b.status}
                  </span>

                  {nextAction[b.status] && (
                    <button
                      onClick={() =>
                        updateStatus(b._id, nextAction[b.status].status)
                      }
                      className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-1.5 text-sm font-semibold transition hover:opacity-90"
                    >
                      {nextAction[b.status].label}
                    </button>
                  )}

                  {b.status === "pending" && (
                    <button
                      onClick={() => updateStatus(b._id, "cancelled")}
                      className="rounded-xl border border-red-400/40 px-4 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}