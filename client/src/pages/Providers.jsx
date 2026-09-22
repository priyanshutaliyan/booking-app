import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Providers() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const isCustomer = user?.role === "customer";

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) setActiveCategory(res.data[0]._id);
        else setLoading(false);
      })
      .catch(() => {
        setError("Couldn't load categories. Please try again.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!activeCategory) return;
    setLoading(true);
    setError("");
    api
      .get(`/providers/category/${activeCategory}`)
      .then((res) => setProviders(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Couldn't load providers.")
      )
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold">Find a Service</h1>
        <p className="mt-1 text-sm text-white/50">
          Choose a category to see available professionals near you.
        </p>

        {/* Category buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveCategory(c._id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                activeCategory === c._id
                  ? "border-transparent bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold text-white"
                  : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-sm text-white/50">Loading providers...</p>
        ) : providers.length === 0 && !error ? (
          <p className="mt-8 text-sm text-white/50">
            No providers available in this category yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => {
              const isOwn = p.userId?._id === userId;
              const firstSlot = p.availability?.[0];

              return (
                <div
                  key={p._id}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">
                        {p.serviceName}
                      </h2>
                      <p className="text-xs text-white/50">{p.userId?.name}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                      ₹{p.pricePerService}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-white/60">
                    {p.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-white/70">
                      ⭐{" "}
                      {p.totalReviews > 0
                        ? `${Number(p.rating).toFixed(1)} (${p.totalReviews})`
                        : "New"}
                    </span>
                    {firstSlot && (
                      <span className="text-white/40">{firstSlot.date}</span>
                    )}
                  </div>

                  {firstSlot && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {firstSlot.timeSlots.slice(0, 3).map((slot) => (
                        <span
                          key={slot}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70"
                        >
                          {slot}
                        </span>
                      ))}
                      {firstSlot.timeSlots.length > 3 && (
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/50">
                          +{firstSlot.timeSlots.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {isCustomer && !isOwn ? (
                    <button
                      onClick={() => navigate(`/book/${p._id}`)}
                      className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 py-2 text-sm font-semibold transition hover:opacity-90"
                    >
                      Book Now
                    </button>
                  ) : (
                    <p className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-center text-xs text-white/50">
                      {isOwn ? "This is your own listing" : "Customers only"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}