import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import CountdownTimer from "../../components/CountdownTimer";

export default function AdminDashboard() {
  const { contract } = useWeb3();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contractElections, setContractElections] = useState([]);
  const [localElections, setLocalElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", startTime: "", endTime: "" });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchElections = async () => {
    if (!contract) return;
    setLoadingElections(true);
    try {
      const count = Number(await contract.electionCount());
      const list = [];
      for (let i = 1; i <= count; i++) {
        const e = await contract.getElection(i);
        list.push({
          id: Number(e.id),
          title: e.title,
          description: e.description,
          startTime: Number(e.startTime),
          endTime: Number(e.endTime),
          active: e.active,
          onChain: true,
        });
      }
      setContractElections(list);
    } catch (err) {
      console.error("Fetch elections error:", err);
    } finally {
      setLoadingElections(false);
    }
  };

  useEffect(() => { fetchElections(); }, [contract]);

  const elections = [...contractElections, ...localElections];

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMsg({ type: "", text: "" });
    const start = Math.floor(new Date(form.startTime).getTime() / 1000);
    const end = Math.floor(new Date(form.endTime).getTime() / 1000);

    if (contract) {
      try {
        const tx = await contract.createElection(form.title, form.description, start, end);
        await tx.wait();
        setMsg({ type: "success", text: "Election created on-chain!" });
        setForm({ title: "", description: "", startTime: "", endTime: "" });
        fetchElections();
      } catch (err) {
        setMsg({ type: "error", text: err.reason || err.message || "Transaction failed" });
      } finally {
        setCreating(false);
      }
      return;
    }

    const localId = Date.now();
    setLocalElections((prev) => [
      ...prev,
      {
        id: localId,
        title: form.title,
        description: form.description,
        startTime: Number(start),
        endTime: Number(end),
        active: true,
        onChain: false,
      },
    ]);
    setMsg({ type: "success", text: "Election created locally. Connect wallet to publish on-chain." });
    setForm({ title: "", description: "", startTime: "", endTime: "" });
    setCreating(false);
  };

  const handleEnd = async (id, onChain) => {
    if (onChain) {
      if (!contract) return;
      try {
        const tx = await contract.endElection(id);
        await tx.wait();
        fetchElections();
      } catch (err) {
        alert(err.reason || err.message);
      }
      return;
    }

    setLocalElections((prev) => prev.map((el) => (el.id === id ? { ...el, active: false } : el)));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-gold text-2xl">⚙</span>
            <h1 className="font-display font-black text-3xl">Admin Dashboard</h1>
          </div>
          <p className="text-muted">Manage elections, candidates, and monitor results</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => navigate("/admin/qrcodes")} className="btn-secondary text-sm py-2 px-4">
              🖨 View QR Codes
            </button>
            <button onClick={() => navigate("/tally")} className="btn-secondary text-sm py-2 px-4">
              📊 Live Tally
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Election */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-gold">+</span> Create Election
            </h2>
            <div className="card border-gold border-opacity-20">
              {msg.text && (
                <div className={`rounded-lg px-4 py-3 mb-4 text-sm ${msg.type === "error" ? "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30" : "bg-accent bg-opacity-10 text-accent border border-accent border-opacity-30"}`}>
                  {msg.text}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Election Title</label>
                  <input className="input-base focus:border-gold" placeholder="e.g. Student Union Elections 2025" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Description</label>
                  <textarea className="input-base focus:border-gold resize-none h-20" placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Start Time</label>
                    <input type="datetime-local" className="input-base focus:border-gold" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">End Time</label>
                    <input type="datetime-local" className="input-base focus:border-gold" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
                  </div>
                </div>
                <button type="submit" disabled={creating} className="w-full bg-gold text-ink font-display font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50">
                  {creating ? (contract ? "Creating on-chain..." : "Saving locally...") : "Create Election"}
                </button>
              </form>
            </div>
          </div>

          {/* Elections list */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-accent">◈</span> Elections
              {loadingElections && <div className="w-4 h-4 border border-accent border-t-transparent rounded-full animate-spin" />}
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {elections.length === 0 && !loadingElections && (
                <div className="card text-center text-muted text-sm py-10">No elections yet</div>
              )}
              {elections.map((el) => (
                <div key={el.id} className="card border-border hover:border-gold hover:border-opacity-40 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-bold text-white">{el.title}</h3>
                      <p className="text-muted text-xs mt-1">{el.description}</p>
                    </div>
                    <span className={el.active ? "badge-live" : "badge-ended"}>
                      <span className={`w-1.5 h-1.5 rounded-full ${el.active ? "bg-accent" : "bg-danger"} animate-pulse`} />
                      {el.active ? "Live" : "Ended"}
                    </span>
                  </div>
                  <CountdownTimer endTime={el.endTime} label="Ends in" />
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => navigate(`/admin/election/${el.id}/candidates`)} className="btn-secondary text-xs py-2 px-3 flex-1">
                      Manage Candidates
                    </button>
                    {el.active && (
                      <button onClick={() => handleEnd(el.id, el.onChain)} className="btn-danger text-xs py-2 px-3">
                        End Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
