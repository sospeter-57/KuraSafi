import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWeb3 } from "../../context/Web3Context";
import { loginUser } from "../../utils/api";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { connectWallet, isConnected } = useWeb3();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ ...form, role: "admin" });
      login({ ...res.data.user, token: res.data.token });
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(42,42,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(42,42,58,0.2)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-gold rounded-full opacity-[0.05] blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="mb-8">
          <Link to="/" className="text-muted hover:text-white text-sm transition-colors">← Back</Link>
        </div>

        <div className="card border-gold border-opacity-40">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gold bg-opacity-10 border border-gold border-opacity-30 flex items-center justify-center">
              <span className="text-gold text-lg">⚙</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-gold">Admin Login</h2>
              <p className="text-muted text-xs">Election management portal</p>
            </div>
          </div>

          {error && (
            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-lg px-4 py-3 mb-6 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Username</label>
              <input
                className="input-base focus:border-gold"
                placeholder="admin_username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Password</label>
              <input
                type="password"
                className="input-base focus:border-gold"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {!isConnected && (
              <button type="button" onClick={connectWallet} className="btn-secondary w-full text-sm">
                Connect MetaMask Wallet
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-ink font-display font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Login as Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
