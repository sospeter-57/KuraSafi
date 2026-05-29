import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import Navbar from "../../components/Navbar";
import { uploadCandidatePhoto } from "../../utils/api";

export default function ManageCandidates() {
  const { electionId } = useParams();
  const { contract, isConnected } = useWeb3();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({ name: "", party: "", photoFile: null, photoPreview: null });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchData = async () => {
    if (!contract) return;
    try {
      const el = await contract.getElection(electionId);
      setElection({ title: el.title, description: el.description, active: el.active });
      const cands = await contract.getElectionCandidates(electionId);
      setCandidates(cands.map((c) => ({
        id: Number(c.id),
        name: c.name,
        party: c.party,
        photoHash: c.photoHash,
        voteCount: Number(c.voteCount),
      })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [contract, electionId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, photoFile: file, photoPreview: URL.createObjectURL(file) });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!contract) return setMsg({ type: "error", text: "Connect wallet first" });
    setAdding(true);
    setMsg({ type: "", text: "" });
    try {
      let photoHash = "";
      if (form.photoFile) {
        const fd = new FormData();
        fd.append("photo", form.photoFile);
        fd.append("electionId", electionId);
        const res = await uploadCandidatePhoto(fd);
        photoHash = res.data.url || "";
      }
      const tx = await contract.addCandidate(electionId, form.name, form.party, photoHash);
      await tx.wait();
      setMsg({ type: "success", text: `${form.name} added as candidate!` });
      setForm({ name: "", party: "", photoFile: null, photoPreview: null });
      fetchData();
    } catch (err) {
      setMsg({ type: "error", text: err.reason || err.message || "Failed to add candidate" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <button onClick={() => navigate("/admin/dashboard")} className="text-muted hover:text-white text-sm mb-8 inline-flex items-center gap-2 transition-colors">
          ← Back to Dashboard
        </button>

        {election && (
          <div className="mb-10">
            <h1 className="font-display font-black text-3xl mb-1">{election.title}</h1>
            <p className="text-muted">{election.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Candidate Form */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-accent">+</span> Add Candidate
            </h2>
            <div className="card">
              {msg.text && (
                <div className={`rounded-lg px-4 py-3 mb-4 text-sm ${msg.type === "error" ? "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30" : "bg-accent bg-opacity-10 text-accent border border-accent border-opacity-30"}`}>
                  {msg.text}
                </div>
              )}
              <form onSubmit={handleAdd} className="space-y-4">
                {/* Photo upload */}
                <div>
                  <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Candidate Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {form.photoPreview
                        ? <img src={form.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        : <span className="text-muted text-2xl">👤</span>}
                    </div>
                    <label className="btn-secondary text-sm cursor-pointer">
                      Upload Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Full Name</label>
                  <input className="input-base" placeholder="Candidate full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-widest font-mono block mb-2">Party / Affiliation</label>
                  <input className="input-base" placeholder="Party name or Independent" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} required />
                </div>

                <button type="submit" disabled={adding || !isConnected} className="btn-primary w-full disabled:opacity-50">
                  {adding ? "Adding on-chain..." : "Add Candidate"}
                </button>
              </form>
            </div>
          </div>

          {/* Candidates list */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4">
              Candidates <span className="text-muted text-base font-normal">({candidates.length})</span>
            </h2>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {candidates.length === 0 && (
                <div className="card text-center text-muted text-sm py-10">No candidates added yet</div>
              )}
              {candidates.map((c) => (
                <div key={c.id} className="card flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {c.photoHash
                      ? <img src={c.photoHash} alt={c.name} className="w-full h-full object-cover" />
                      : <span className="text-muted text-xl">👤</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-white">{c.name}</p>
                    <p className="text-muted text-xs">{c.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-accent text-lg">{c.voteCount}</p>
                    <p className="text-muted text-xs">votes</p>
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
