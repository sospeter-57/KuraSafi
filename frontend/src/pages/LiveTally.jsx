import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import Navbar from "../components/Navbar";
import CountdownTimer from "../components/CountdownTimer";

export default function LiveTally() {
  const { electionId } = useParams();
  const { contract, connectWallet, isConnected } = useWeb3();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [elections, setElections] = useState([]);
  const intervalRef = useRef(null);

  const fetchTally = async (id) => {
    if (!contract) return;
    try {
      const el = await contract.getElection(id);
      setElection({ id: Number(el.id), title: el.title, description: el.description, endTime: Number(el.endTime), active: el.active });
      const cands = await contract.getElectionCandidates(id);
      const total = await contract.getTotalVotes(id);
      const mapped = cands.map((c) => ({ id: Number(c.id), name: c.name, party: c.party, photoHash: c.photoHash, voteCount: Number(c.voteCount) }))
        .sort((a, b) => b.voteCount - a.voteCount);
      setCandidates(mapped);
      setTotalVotes(Number(total));
    } catch (err) { console.error(err); }
  };

  const fetchElections = async () => {
    if (!contract) return;
    const count = Number(await contract.electionCount());
    const list = [];
    for (let i = 1; i <= count; i++) {
      const e = await contract.getElection(i);
      list.push({ id: Number(e.id), title: e.title });
    }
    setElections(list);
  };

  const activeId = electionId || (elections[0]?.id);

  useEffect(() => {
    if (!contract) return;
    fetchElections();
    if (activeId) {
      fetchTally(activeId);
      intervalRef.current = setInterval(() => fetchTally(activeId), 10000);
    }
    return () => clearInterval(intervalRef.current);
  }, [contract, activeId]);

  const maxVotes = candidates[0]?.voteCount || 1;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono text-accent uppercase tracking-widest">Live Tally</span>
            </div>
            <h1 className="font-display font-black text-3xl">{election?.title || "Loading..."}</h1>
            <p className="text-muted text-sm mt-1">{election?.description}</p>
          </div>
          {election && <CountdownTimer endTime={election.endTime} />}
        </div>

        {/* Election switcher */}
        {elections.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {elections.map((el) => (
              <button key={el.id} onClick={() => navigate(`/tally/${el.id}`)}
                className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${Number(electionId) === el.id ? "border-accent text-accent bg-accent bg-opacity-10" : "border-border text-muted hover:border-accent hover:text-accent"}`}>
                {el.title}
              </button>
            ))}
          </div>
        )}

        {!isConnected && (
          <div className="card mb-8 flex items-center justify-between">
            <p className="text-muted text-sm">Connect wallet to see live blockchain data</p>
            <button onClick={connectWallet} className="btn-primary text-sm py-2 px-4">Connect</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">Total Votes</p>
            <p className="font-display font-black text-3xl text-accent">{totalVotes}</p>
          </div>
          <div className="card">
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">Candidates</p>
            <p className="font-display font-black text-3xl text-white">{candidates.length}</p>
          </div>
          <div className="card col-span-2 sm:col-span-1">
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">Status</p>
            <span className={election?.active ? "badge-live" : "badge-ended"}>
              <span className={`w-1.5 h-1.5 rounded-full ${election?.active ? "bg-accent" : "bg-danger"} animate-pulse`} />
              {election?.active ? "Live" : "Ended"}
            </span>
          </div>
        </div>

        {/* Candidate bars */}
        <div className="space-y-4">
          {candidates.map((c, i) => {
            const pct = totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0;
            const isLeading = i === 0 && c.voteCount > 0;
            return (
              <div key={c.id} className={`card transition-all ${isLeading ? "border-accent border-opacity-50" : ""}`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {c.photoHash ? <img src={c.photoHash} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-white">{c.name}</p>
                      {isLeading && <span className="text-xs bg-accent bg-opacity-10 text-accent border border-accent border-opacity-30 px-2 py-0.5 rounded-full font-mono">Leading</span>}
                    </div>
                    <p className="text-muted text-xs">{c.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xl text-white">{c.voteCount}</p>
                    <p className="text-muted text-xs">{pct}%</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isLeading ? "bg-accent" : "bg-border"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {candidates.length === 0 && (
            <div className="card text-center text-muted py-16">
              {isConnected ? "No candidates yet" : "Connect wallet to load results"}
            </div>
          )}
        </div>

        <p className="text-muted text-xs font-mono text-center mt-8">
          ↻ Auto-refreshes every 10 seconds · Data sourced from Ethereum blockchain
        </p>
      </div>
    </div>
  );
}
