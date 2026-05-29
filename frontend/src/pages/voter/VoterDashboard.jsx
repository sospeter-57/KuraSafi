import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import CountdownTimer from "../../components/CountdownTimer";

// Steps: "elections" -> "candidates" -> "confirm" -> "receipt"
export default function VoterDashboard() {
  const { contract, isConnected, account } = useWeb3();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("elections");
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState({});
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchElections = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const count = Number(await contract.electionCount());
      const list = [];
      const votedMap = {};
      for (let i = 1; i <= count; i++) {
        const e = await contract.getElection(i);
        const live = await contract.isElectionLive(i);
        const voted = await contract.verifyVote(i);
        votedMap[i] = voted;
        list.push({
          id: Number(e.id), title: e.title, description: e.description,
          startTime: Number(e.startTime), endTime: Number(e.endTime),
          active: e.active, live,
        });
      }
      setElections(list);
      setHasVoted(votedMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchElections(); }, [contract]);

  // If voter already voted, lock to tally
  useEffect(() => {
    const votedInAny = Object.values(hasVoted).some(Boolean);
    const liveElection = elections.find((e) => e.live);
    if (votedInAny && liveElection) navigate(`/tally/${liveElection.id}`);
  }, [hasVoted, elections]);

  const selectElection = async (el) => {
    if (!el.live) return;
    setSelectedElection(el);
    const cands = await contract.getElectionCandidates(el.id);
    setCandidates(cands.map((c) => ({
      id: Number(c.id), name: c.name, party: c.party, photoHash: c.photoHash, voteCount: Number(c.voteCount),
    })));
    setStep("candidates");
  };

  const selectCandidate = (c) => {
    setSelectedCandidate(c);
    setStep("confirm");
  };

  const submitVote = async () => {
    if (!contract || !selectedCandidate) return;
    setVoting(true);
    setError("");
    try {
      const tx = await contract.castVote(selectedElection.id, selectedCandidate.id);
      await tx.wait();
      setStep("receipt");
    } catch (err) {
      setError(err.reason || err.message || "Vote failed");
      setStep("candidates");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">

        {step === "elections" && (
          <>
            <div className="mb-10">
              <h1 className="font-display font-black text-3xl mb-1">Voter Dashboard</h1>
              <p className="text-muted">Welcome, <span className="text-accent">{user?.fullName}</span>. Select an active election to vote.</p>
            </div>
            {loading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}
            <div className="grid gap-4">
              {elections.map((el) => (
                <div key={el.id} className={`card transition-all ${el.live && !hasVoted[el.id] ? "border-accent border-opacity-40 hover:border-opacity-80 cursor-pointer" : "opacity-60"}`}
                  onClick={() => selectElection(el)}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-xl mb-1">{el.title}</h3>
                      <p className="text-muted text-sm">{el.description}</p>
                    </div>
                    <span className={el.live ? "badge-live" : "badge-ended"}>
                      <span className={`w-1.5 h-1.5 rounded-full ${el.live ? "bg-accent" : "bg-danger"} animate-pulse`} />
                      {hasVoted[el.id] ? "Voted" : el.live ? "Live" : "Ended"}
                    </span>
                  </div>
                  <CountdownTimer endTime={el.endTime} />
                  {el.live && !hasVoted[el.id] && (
                    <p className="text-accent text-sm mt-4 font-mono">Click to vote →</p>
                  )}
                  {hasVoted[el.id] && (
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/tally/${el.id}`); }}
                      className="mt-4 text-sm text-muted hover:text-accent transition-colors font-mono">
                      View live tally →
                    </button>
                  )}
                </div>
              ))}
              {!loading && elections.length === 0 && (
                <div className="card text-center text-muted py-16">No elections available</div>
              )}
            </div>
          </>
        )}

        {step === "candidates" && selectedElection && (
          <>
            <div className="mb-10">
              <button onClick={() => setStep("elections")} className="text-muted hover:text-white text-sm mb-4 block transition-colors">← Back</button>
              <h1 className="font-display font-black text-3xl mb-1">{selectedElection.title}</h1>
              <p className="text-muted">Select a candidate to vote for</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidates.map((c) => (
                <div key={c.id} onClick={() => selectCandidate(c)}
                  className="card border-border hover:border-accent hover:border-opacity-60 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {c.photoHash ? <img src={c.photoHash} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-3xl">👤</span>}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white group-hover:text-accent transition-colors">{c.name}</h3>
                      <p className="text-muted text-sm">{c.party}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted font-mono">ID #{c.id}</span>
                    <span className="text-xs text-accent font-mono group-hover:opacity-100 opacity-0 transition-opacity">Select →</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === "confirm" && selectedCandidate && (
          <div className="max-w-md mx-auto">
            <h1 className="font-display font-black text-3xl mb-8 text-center">Confirm Your Vote</h1>
            <div className="card border-gold border-opacity-40 mb-6">
              <p className="text-xs text-muted font-mono uppercase tracking-widest mb-4">You are voting for</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden">
                  {selectedCandidate.photoHash ? <img src={selectedCandidate.photoHash} alt={selectedCandidate.name} className="w-full h-full object-cover" /> : <span className="text-4xl">👤</span>}
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-white">{selectedCandidate.name}</h3>
                  <p className="text-muted">{selectedCandidate.party}</p>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3">
                <p className="text-xs text-muted font-mono">Election: <span className="text-white">{selectedElection?.title}</span></p>
                <p className="text-xs text-danger font-mono mt-1">⚠ This action is permanent and cannot be undone</p>
              </div>
            </div>

            {error && <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-lg px-4 py-3 mb-4 text-danger text-sm">{error}</div>}

            <div className="flex gap-3">
              <button onClick={() => setStep("candidates")} className="btn-secondary flex-1">Change</button>
              <button onClick={submitVote} disabled={voting} className="btn-primary flex-1 disabled:opacity-50">
                {voting ? "Recording vote..." : "Confirm Vote"}
              </button>
            </div>
          </div>
        )}

        {step === "receipt" && (
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-accent bg-opacity-10 border-2 border-accent flex items-center justify-center mx-auto mb-6">
              <span className="text-accent text-4xl">✓</span>
            </div>
            <h1 className="font-display font-black text-3xl mb-3 text-accent">Vote Recorded!</h1>
            <p className="text-muted mb-8">Your vote has been permanently stored on the Ethereum blockchain. It is immutable and anonymous.</p>
            <div className="card border-accent border-opacity-20 mb-8 text-left">
              <p className="text-xs text-muted font-mono uppercase tracking-widest mb-3">Vote Receipt</p>
              <p className="text-sm text-white"><span className="text-muted">Candidate:</span> {selectedCandidate?.name}</p>
              <p className="text-sm text-white mt-1"><span className="text-muted">Election:</span> {selectedElection?.title}</p>
              <p className="text-sm text-white mt-1"><span className="text-muted">Wallet:</span> <span className="font-mono text-xs">{account}</span></p>
            </div>
            <button onClick={() => navigate(`/tally/${selectedElection?.id}`)} className="btn-primary w-full">
              View Live Tally →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
