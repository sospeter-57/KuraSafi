import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import { registerCandidate } from "../../utils/api";

export default function CandidateRegister() {
  const [form, setForm] = useState({ fullName: "", nationalId: "", party: "", walletAddress: "", biometricHash: "" });
  const [biometricScanned, setBiometricScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { contract, isConnected, connectWallet, account } = useWeb3();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.nationalId || !form.party) return setError("Please complete all fields");
    if (!biometricScanned) return setError("Please complete the biometric scan");
    setLoading(true);
    setError("");
    try {
      const walletAddress = form.walletAddress.trim() || account || "";
      const useOnChain = Boolean(account && !form.walletAddress.trim());
      await registerCandidate({ ...form, walletAddress });
      if (useOnChain) {
        const tx = await contract.registerVoter(form.nationalId);
        await tx.wait();
      }
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.reason || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full card border-blue-400 border-opacity-30 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-400 bg-opacity-10 border border-blue-400 border-opacity-30 flex items-center justify-center mx-auto">
          <span className="text-blue-400 text-3xl">◈</span>
        </div>
        <h3 className="font-display font-bold text-xl text-blue-400">Registered!</h3>
        <p className="text-muted text-sm">You are registered as a candidate and voter. An admin will add you to an election.</p>
        <button onClick={() => navigate("/candidate/login")} className="w-full bg-blue-500 text-white font-display font-bold py-3 rounded-lg hover:bg-blue-400 transition-all">
          Go to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(42,42,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(42,42,58,0.2)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="mb-8">
          <Link to="/candidate/login" className="text-muted hover:text-white text-sm transition-colors">← Back to Login</Link>
        </div>

        <div className="card border-blue-400 border-opacity-30">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-400 bg-opacity-10 border border-blue-400 border-opacity-30 flex items-center justify-center">
              <span className="text-blue-400 text-lg">◈</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-blue-400">Candidate Registration</h2>
              <p className="text-muted text-xs">Register as a candidate and voter</p>
            </div>
          </div>

          {error && <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-lg px-4 py-3 mb-6 text-danger text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Full Name</label>
              <input className="input-base focus:border-blue-400" placeholder="As per National ID" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">National ID Number</label>
              <input className="input-base focus:border-blue-400" placeholder="e.g. 12345678" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Party / Affiliation</label>
              <input className="input-base focus:border-blue-400" placeholder="Party or Independent" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Wallet Address (manual fallback)</label>
              <input className="input-base focus:border-blue-400" placeholder="0x... or connect MetaMask" value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} />
            </div>

            {!isConnected ? (
              <button type="button" onClick={connectWallet} className="btn-secondary w-full text-sm">Connect MetaMask</button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-blue-400 font-mono"><div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />Wallet connected</div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, walletAddress: account || "" })}
                  className="btn-secondary w-full text-sm"
                >
                  Use connected wallet for registration
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setForm({ ...form, biometricHash: `SIMULATED_BIO_${account?.slice(-6)}_${Date.now()}` });
                setBiometricScanned(true);
                setError("");
              }}
              className="btn-secondary w-full text-sm disabled:opacity-50"
            >
              {biometricScanned ? "Fingerprint scanned" : "Simulate biometric scan"}
            </button>

            <p className="text-muted text-sm leading-relaxed">
              By registering, your National ID will be saved with the chosen wallet address. To register on-chain, use the connected wallet; otherwise enter a manual wallet address.
            </p>

            <button type="submit" disabled={loading || !biometricScanned} className="w-full bg-blue-500 text-white font-display font-bold py-3 rounded-lg hover:bg-blue-400 transition-all disabled:opacity-50">
              {loading ? "Registering..." : "Register as Candidate"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
