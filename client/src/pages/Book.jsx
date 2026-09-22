import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Book() {
  const { providerId } = useParams();
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get(`/providers/${providerId}`)
      .then((res) => {
        setProvider(res.data);
        const first = res.data.availability?.[0];
        if (first) setSelectedDate(first.date);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Couldn't load this provider.")
      )
      .finally(() => setLoading(false));
  }, [providerId]);

  const slotsForDate =
    provider?.availability?.find((a) => a.date === selectedDate)?.timeSlots ||
    [];

  const handleConfirm = async () => {
    setError("");

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time slot");
      return;
    }

    const customerId = user?._id || user?.id;
    if (!customerId) {
      setError("Couldn't identify your account. Please sign in again.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        customerId,
        providerId,
        slotDate: selectedDate,
        slotTime: selectedTime,
        price: provider.pricePerService,
        address,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-8">
        {loading ? (
          <p className="text-white/60">Loading...</p>
        ) : !provider ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error || "Provider not found"}
          </p>
        ) : success ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            <p className="text-5xl">✅</p>
            <h1 className="mt-4 text-2xl font-bold">Booking Confirmed</h1>
            <p className="mt-2 text-white/70">
              {provider.serviceName} • {selectedDate} • {selectedTime}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/providers"
                className="rounded-xl border border-white/20 px-5 py-2.5 transition hover:bg-white/10"
              >
                Browse More Services
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2.5 font-semibold transition hover:opacity-90"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h1 className="text-2xl font-bold">Confirm Your Booking</h1>

            <div className="mt-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{provider.serviceName}</h2>
                <p className="text-sm text-white/60">by {provider.userId?.name}</p>
                <p className="mt-2 text-sm text-white/70">{provider.description}</p>
              </div>
              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm font-semibold text-cyan-300">
                ₹{provider.pricePerService}
              </span>
            </div>

            {error && (
              <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <p className="mt-6 text-sm text-white/70">Select a date</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {provider.availability?.map((a) => (
                <button
                  key={a.date}
                  onClick={() => {
                    setSelectedDate(a.date);
                    setSelectedTime("");
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm transition ${
                    selectedDate === a.date
                      ? "border-transparent bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {a.date}
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm text-white/70">Select a time slot</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slotsForDate.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-lg border px-4 py-2 text-sm transition ${
                    selectedTime === slot
                      ? "border-transparent bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm text-white/70">Address (optional)</p>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-black placeholder-black/40 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}