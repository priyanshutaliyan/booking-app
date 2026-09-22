import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

const roleStyle = {
  customer: "bg-blue-500/15 text-blue-300",
  provider: "bg-purple-500/15 text-purple-300",
  admin: "bg-yellow-500/15 text-yellow-300",
};

export default function AdminPanel() {
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setError("");
    try {
      const [sRes, uRes, pRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/providers"),
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
      setProviders(pRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleSuspend = async (u) => {
    const action = u.isSuspended ? "unsuspend" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} ${u.name}?`)) return;
    try {
      await api.put(`/admin/users/${u._id}/suspend`, {
        isSuspended: !u.isSuspended,
      });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update the user.");
    }
  };

  const toggleVerify = async (p) => {
    try {
      await api.put(`/admin/providers/${p._id}/verify`, {
        isVerified: !p.isVerified,
      });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update the provider.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  });

  const statCards = stats
    ? [
        { label: "Customers", value: stats.customers },
        { label: "Providers", value: stats.providers },
        { label: "Suspended", value: stats.suspended },
        { label: "Bookings", value: stats.bookings },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage users and providers, and suspend accounts if needed
        </p>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-white/60">Loading...</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {statCards.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <p className="text-sm text-white/60">{s.label}</p>
                  <p className="mt-1 text-3xl font-bold text-cyan-300">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              {[
                { key: "users", label: "Users" },
                { key: "providers", label: "Providers" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-full border px-5 py-2 text-sm transition ${
                    tab === t.key
                      ? "border-transparent bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold"
                      : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "users" && (
              <div className="mt-6">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-black placeholder-black/40 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 sm:max-w-sm"
                />

                <div className="mt-4 space-y-3">
                  {filteredUsers.length === 0 && (
                    <p className="text-white/60">No users found.</p>
                  )}

                  {filteredUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-sm text-white/60">{u.email}</p>
                        {u.phone && (
                          <p className="text-xs text-white/40">📞 {u.phone}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            roleStyle[u.role] || "bg-white/10"
                          }`}
                        >
                          {u.role}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            u.isSuspended
                              ? "bg-red-500/15 text-red-300"
                              : "bg-green-500/15 text-green-300"
                          }`}
                        >
                          {u.isSuspended ? "Suspended" : "Active"}
                        </span>

                        {u.role !== "admin" && (
                          <button
                            onClick={() => toggleSuspend(u)}
                            className={`rounded-xl border px-4 py-1.5 text-sm transition ${
                              u.isSuspended
                                ? "border-green-400/40 text-green-300 hover:bg-green-500/10"
                                : "border-red-400/40 text-red-300 hover:bg-red-500/10"
                            }`}
                          >
                            {u.isSuspended ? "Unsuspend" : "Suspend"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "providers" && (
              <div className="mt-6 space-y-3">
                {providers.length === 0 && (
                  <p className="text-white/60">No provider services yet.</p>
                )}

                {providers.map((p) => (
                  <div
                    key={p._id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {p.serviceName}{" "}
                        <span className="text-sm font-normal text-white/50">
                          • {p.category?.name}
                        </span>
                      </p>
                      <p className="text-sm text-white/60">
                        by {p.userId?.name} ({p.userId?.email})
                      </p>
                      <p className="text-sm text-cyan-300">₹{p.pricePerService}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {p.userId?.isSuspended && (
                        <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                          Owner suspended
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.isVerified
                            ? "bg-green-500/15 text-green-300"
                            : "bg-yellow-500/15 text-yellow-300"
                        }`}
                      >
                        {p.isVerified ? "Verified" : "Not verified"}
                      </span>

                      <button
                        onClick={() => toggleVerify(p)}
                        className="rounded-xl border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white/10"
                      >
                        {p.isVerified ? "Unverify" : "Verify"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}