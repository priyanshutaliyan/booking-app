import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        ...form,
        email: form.email.trim(),
      });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-black placeholder-black/40 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0f1f] px-4 py-8">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Your Account</h1>
          <p className="mt-1 text-sm text-white/60">Join to book or offer services</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <input name="name" placeholder="Full name" className={inputClass} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email address" className={inputClass} onChange={handleChange} required />
        <input name="phone" placeholder="Phone number" className={inputClass} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" className={inputClass} onChange={handleChange} required />

        <div>
          <label className="mb-1 block text-sm text-white/70">I am a</label>
          <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
            <option value="customer">Customer — booking services</option>
            <option value="provider">Service Provider — offering services</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-purple-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}