import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import { registerUser } from "../../utils/api";

export default function VoterRegister() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: "", nationalId: "", walletAddress: "", biometricHash: "" });
  const [biometricScanned, setBiometricScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { contract, isConnected, connectWallet, account } = useWeb3();
  const navigate = useNavigate();

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.nationalId) return setError("Please enter your full name and national ID");
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!biometricScanned) return setError("Please complete the biometric scan");
    setLoading(true);
    setError("");
    try {
      const walletAddress = form.walletAddress.trim() || account || "";
      const useOnChain = Boolean(account && !form.walletAddress.trim());
      await registerUser({ ...form, role: "voter", walletAddress });
      if (useOnChain) {
        const tx = await contract.registerVoter(form.nationalId);
        await tx.wait();
      }
      setSuccess(true);
      setStep(3);
      // Auto-redirect to waiting room after 2s
      setTimeout(() => navigate("/voter/waiting"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.reason || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(42,42,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(42,42,58,0.2)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/voter/login" className="text-muted hover:text-white text-sm transition-colors">← Back to Login</Link>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-colors ${step >= s ? "bg-accent" : "bg-border"}`} />
            ))}
          </div>
        </div>

        <div className="card border-accent border-opacity-30">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent bg-opacity-10 border border-accent border-opacity-30 flex items-center justify-center">
              <span className="text-accent text-lg">✓</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-accent">Voter Registration</h2>
              <p className="text-muted text-xs">Step {step} of 3 — {["Personal Details", "Wallet & Confirm", "Done"][step - 1]}</p>
            </div>
          </div>

          {error && (
            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-lg px-4 py-3 mb-6 text-danger text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Full Name</label>
                <input className="input-base" placeholder="As per National ID" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">National ID Number</label>
                <input className="input-base" placeholder="e.g. 12345678" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} required />
              </div>
              <button type="submit" className="btn-primary w-full">Next →</button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
                <p className="text-xs text-muted font-mono uppercase tracking-widest">Review Details</p>
                <p className="text-white"><span className="text-muted">Name:</span> {form.fullName}</p>
                <p className="text-white"><span className="text-muted">ID:</span> {form.nationalId}</p>
              </div>

              {!isConnected ? (
                <button onClick={connectWallet} className="btn-secondary w-full">Connect MetaMask Wallet</button>
              ) : (
                <div className="flex items-center gap-2 bg-accent bg-opacity-10 border border-accent border-opacity-30 rounded-lg px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-accent text-xs font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                </div>
              )}

              <div>
                <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Wallet Address (manual fallback)</label>
                <input
                  className="input-base"
                  placeholder="0x... or connect MetaMask"
                  value={form.walletAddress}
                  onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                />
              </div>

              {!isConnected ? (
                <button onClick={connectWallet} className="btn-secondary w-full">Connect MetaMask Wallet</button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-accent bg-opacity-10 border border-accent border-opacity-30 rounded-lg px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-accent text-xs font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                  </div>
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
                By registering, your National ID will be saved with the provided wallet address. If you want blockchain registration, use the connected wallet; otherwise enter a manual wallet address.
              </p>

              <button onClick={handleSubmit} disabled={loading || !biometricScanned} className="btn-primary w-full disabled:opacity-50">
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent bg-opacity-10 border border-accent border-opacity-30 flex items-center justify-center mx-auto">
                <span className="text-accent text-3xl">✓</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-accent mb-2">Registered!</h3>
                <p className="text-muted text-sm">Your vote is now secured on the blockchain. Redirecting to the election waiting room...</p>
              </div>
              <button onClick={() => navigate("/voter/waiting")} className="btn-primary w-full">Go to Waiting Room →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
