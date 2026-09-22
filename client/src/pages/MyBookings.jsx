import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function MyBookings() {
  const { user } = useAuth();
  const customerId = user?._id || user?.id;

  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");

  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadBookings = async () => {
    setError("");
    try {
      const [bRes, pRes, rRes] = await Promise.all([
        api.get(`/bookings/customer/${customerId}`),
        api.get(`/payments/customer/${customerId}`),
        api.get(`/reviews/customer/${customerId}`),
      ]);
      setBookings(bRes.data);
      setPayments(pRes.data);
      setReviews(rRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    loadBookings();
  }, [customerId]);

  const paidPayment = (bookingId) =>
    payments.find((p) => p.bookingId === bookingId && p.status === "paid");

  const bookingReview = (bookingId) =>
    reviews.find((r) => r.bookingId === bookingId);

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}/status`, { status: "cancelled" });
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't cancel the booking.");
    }
  };

  const handlePay = async (b, method) => {
    setPayingId(b._id);
    setError("");
    try {
      let payment = payments.find(
        (p) => p.bookingId === b._id && p.status === "pending"
      );
      if (!payment) {
        const res = await api.post("/payments", {
          bookingId: b._id,
          amount: b.price,
          method,
        });
        payment = res.data;
      }
      await api.put(`/payments/${payment._id}/pay`);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const openReviewForm = (id) => {
    setReviewingId(id);
    setRating(5);
    setComment("");
  };

  const submitReview = async (b) => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/reviews", {
        bookingId: b._id,
        customerId,
        providerId: b.providerId._id,
        rating,
        comment,
      });
      setReviewingId(null);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="mt-1 text-sm text-white/50">Track and manage all your service bookings</p>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-white/60">Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/70">You haven't made any bookings yet.</p>
            <Link
              to="/providers"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2.5 font-semibold transition hover:opacity-90"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((b) => {
              const paid = paidPayment(b._id);
              const review = bookingReview(b._id);

              return (
                <div
                  key={b._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {b.providerId?.serviceName || "Service no longer available"}
                      </h2>
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

                      {b.status === "pending" && (
                        <button
                          onClick={() => cancelBooking(b._id)}
                          className="rounded-xl border border-red-400/40 px-4 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10"
                        >
                          Cancel
                        </button>
                      )}

                      {b.status === "completed" && paid && (
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                          💳 Paid ({paid.method})
                        </span>
                      )}

                      {b.status === "completed" && !paid && (
                        <>
                          <button
                            disabled={payingId === b._id}
                            onClick={() => handlePay(b, "cash")}
                            className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-1.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                          >
                            {payingId === b._id ? "Please wait..." : "Pay Cash"}
                          </button>
                          <button
                            disabled={payingId === b._id}
                            onClick={() => handlePay(b, "online")}
                            className="rounded-xl border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white/10 disabled:opacity-50"
                          >
                            Pay Online
                          </button>
                        </>
                      )}

                      {b.status === "completed" &&
                        paid &&
                        !review &&
                        b.providerId &&
                        reviewingId !== b._id && (
                          <button
                            onClick={() => openReviewForm(b._id)}
                            className="rounded-xl border border-yellow-400/40 px-4 py-1.5 text-sm text-yellow-300 transition hover:bg-yellow-500/10"
                          >
                            ⭐ Rate Service
                          </button>
                        )}
                    </div>
                  </div>

                  {review && (
                    <p className="mt-4 border-t border-white/10 pt-4 text-sm text-white/80">
                      ⭐ Your rating: {review.rating}/5
                      {review.comment ? ` • ${review.comment}` : ""}
                    </p>
                  )}

                  {reviewingId === b._id && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-sm text-white/70">Rate this service</p>
                      <div className="mt-1 flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRating(n)}
                            className={`text-3xl transition ${
                              n <= rating ? "text-yellow-400" : "text-white/20"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience (optional)"
                        rows={3}
                        className="mt-3 w-full rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-black placeholder-black/40 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          disabled={submitting}
                          onClick={() => submitReview(b)}
                          className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                        <button
                          onClick={() => setReviewingId(null)}
                          className="rounded-xl border border-white/20 px-5 py-2 text-sm transition hover:bg-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
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