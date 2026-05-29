import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWeb3 } from "../../context/Web3Context";
import { loginUser } from "../../utils/api";

export default function CandidateLogin() {
  const [form, setForm] = useState({ nationalId: "", walletAddress: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { connectWallet, isConnected, account } = useWeb3();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, role: "candidate" };
      if (form.walletAddress) payload.walletAddress = form.walletAddress.trim();
      const res = await loginUser(payload);
      login({ ...res.data.user, token: res.data.token });
      navigate("/candidate/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(42,42,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(42,42,58,0.2)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-blue-400 rounded-full opacity-[0.05] blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="text-muted hover:text-white text-sm transition-colors">← Back</Link>
          <Link to="/candidate/register" className="text-blue-400 text-sm hover:underline">Register →</Link>
        </div>

        <div className="card border-blue-400 border-opacity-30">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-400 bg-opacity-10 border border-blue-400 border-opacity-30 flex items-center justify-center">
              <span className="text-blue-400 text-lg">◈</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-blue-400">Candidate Login</h2>
              <p className="text-muted text-xs">Access your candidate portal</p>
            </div>
          </div>

          {error && (
            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-lg px-4 py-3 mb-6 text-danger text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">National ID Number</label>
              <input className="input-base focus:border-blue-400" placeholder="e.g. 12345678" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} required />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-widest font-mono mb-2">Use your National ID to login. Wallet connection is optional but recommended.</p>
            </div>

            {!isConnected && (
              <button type="button" onClick={connectWallet} className="btn-secondary w-full text-sm">Connect MetaMask</button>
            )}
            {isConnected && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />Wallet connected
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, walletAddress: account || "" })}
                  className="btn-secondary w-full text-sm"
                >
                  Use connected wallet for login
                </button>
              </div>
            )}

            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Wallet Address (optional)</label>
              <input
                className="input-base focus:border-blue-400"
                placeholder="0x... or use connected wallet"
                value={form.walletAddress}
                onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white font-display font-bold py-3 rounded-lg hover:bg-blue-400 transition-all disabled:opacity-50">
              {loading ? "Authenticating..." : "Login as Candidate"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
