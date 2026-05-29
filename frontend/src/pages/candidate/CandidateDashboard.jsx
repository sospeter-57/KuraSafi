import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import CountdownTimer from "../../components/CountdownTimer";

export default function CandidateDashboard() {
  const { contract } = useWeb3();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [myCandidacies, setMyCandidacies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!contract) return;
      setLoading(true);
      try {
        const count = Number(await contract.electionCount());
        const allElections = [];
        const found = [];
        for (let i = 1; i <= count; i++) {
          const e = await contract.getElection(i);
          const cands = await contract.getElectionCandidates(i);
          allElections.push({ id: Number(e.id), title: e.title, endTime: Number(e.endTime), active: e.active });
          const mine = cands.find((c) => c.name.toLowerCase() === user?.fullName?.toLowerCase());
          if (mine) found.push({ electionId: Number(e.id), electionTitle: e.title, endTime: Number(e.endTime), active: e.active, ...mine, id: Number(mine.id), voteCount: Number(mine.voteCount) });
        }
        setElections(allElections);
        setMyCandidacies(found);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [contract]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display font-black text-3xl mb-1">Candidate Dashboard</h1>
          <p className="text-muted">Welcome, <span className="text-blue-400">{user?.fullName}</span></p>
        </div>

        {loading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /></div>}

        {myCandidacies.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display font-bold text-xl mb-4 text-blue-400">Your Candidacies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myCandidacies.map((c) => (
                <div key={c.id} className="card border-blue-400 border-opacity-30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden">
                      {c.photoHash ? <img src={c.photoHash} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-3xl">👤</span>}
                    </div>
                    <div>
                      <p className="font-display font-bold text-white">{c.name}</p>
                      <p className="text-muted text-xs">{c.party}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted font-mono mb-2">{c.electionTitle}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-mono font-black text-4xl text-blue-400">{c.voteCount}</p>
                      <p className="text-muted text-xs">votes received</p>
                    </div>
                    <span className={c.active ? "badge-live" : "badge-ended"}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.active ? "bg-accent" : "bg-danger"} animate-pulse`} />
                      {c.active ? "Live" : "Ended"}
                    </span>
                  </div>
                  <CountdownTimer endTime={c.endTime} />
                  <button onClick={() => navigate(`/tally/${c.electionId}`)} className="btn-secondary w-full mt-4 text-sm">
                    View Live Tally →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {myCandidacies.length === 0 && !loading && (
          <div className="card text-center py-16 text-muted">
            <p className="text-4xl mb-4">◈</p>
            <p>You have not been added to any election yet.</p>
            <p className="text-xs mt-2">Contact the admin to be added as a candidate.</p>
          </div>
        )}

        <div>
          <h2 className="font-display font-bold text-xl mb-4">All Elections</h2>
          <div className="grid gap-3">
            {elections.map((el) => (
              <div key={el.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-white">{el.title}</p>
                  <CountdownTimer endTime={el.endTime} />
                </div>
                <button onClick={() => navigate(`/tally/${el.id}`)} className="btn-secondary text-xs py-2 px-4">Tally →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
