import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const ALL_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "12:00 PM",
  "2:00 PM",
  "4:00 PM",
  "5:00 PM",
  "7:00 PM",
];

export default function AddService() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "",
    serviceName: "",
    description: "",
    pricePerService: "",
    date: "",
  });
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) {
          setForm((f) => ({ ...f, category: res.data[0]._id }));
        }
      })
      .catch(() => setError("Couldn't load categories."));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSlot = (slot) =>
    setSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.date) {
      setError("Please select an available date");
      return;
    }
    if (slots.length === 0) {
      setError("Please select at least one time slot");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/providers", {
        userId,
        category: form.category,
        serviceName: form.serviceName,
        description: form.description,
        pricePerService: Number(form.pricePerService),
        availability: [{ date: form.date, timeSlots: slots }],
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't add the service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      category: categories[0]?._id || "",
      serviceName: "",
      description: "",
      pricePerService: "",
      date: "",
    });
    setSlots([]);
    setSuccess(false);
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-black placeholder-black/40 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30";

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <Navbar />

      <div className="mx-auto max-w-xl px-6 py-8">
        <h1 className="text-2xl font-bold">Add a Service</h1>
        <p className="mt-1 text-sm text-white/50">
          List your service so customers can find and book you
        </p>

        {success ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            <p className="text-5xl">✅</p>
            <h2 className="mt-4 text-2xl font-bold">Service Added</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={resetForm}
                className="rounded-xl border border-white/20 px-5 py-2.5 transition hover:bg-white/10"
              >
                Add Another Service
              </button>
              <Link
                to="/provider"
                className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2.5 font-semibold transition hover:opacity-90"
              >
                Go to Provider Panel
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1 block text-sm text-white/70">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/70">Service name</label>
              <input
                name="serviceName"
                value={form.serviceName}
                onChange={handleChange}
                placeholder="e.g. Pipe Leakage Repair"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/70">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe what this service includes"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/70">Price (₹)</label>
              <input
                name="pricePerService"
                type="number"
                min="0"
                value={form.pricePerService}
                onChange={handleChange}
                placeholder="300"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/70">Available date</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Time slots</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      slots.includes(slot)
                        ? "border-transparent bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold"
                        : "border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 py-3 font-semibold shadow-lg shadow-purple-500/30 transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Service"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}