import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import CountdownTimer from "../../components/CountdownTimer";
import QRDisplay from "../../components/QRDisplay";

export default function ElectionWaiting() {
  const { contract } = useWeb3();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [nextElection, setNextElection] = useState(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!contract) return;
    try {
      const count = Number(await contract.electionCount());
      const now = Math.floor(Date.now() / 1000);
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
        });
      }

      setElections(list);

      // Find the next upcoming or live election
      const upcoming = list
        .filter((e) => e.endTime > now && e.active)
        .sort((a, b) => a.startTime - b.startTime);

      if (upcoming.length > 0) setNextElection(upcoming[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate live registrations ticker (in prod, this would be a websocket or polling backend)
  useEffect(() => {
    const names = [
      "J. Otieno", "A. Wanjiku", "M. Odhiambo", "F. Kamau",
      "B. Achieng", "P. Mwangi", "L. Omondi", "R. Njoroge",
    ];
    let idx = 0;
    setRegisteredCount(Math.floor(Math.random() * 40) + 10);

    const ticker = setInterval(() => {
      const name = names[idx % names.length];
      idx++;
      setRegisteredCount((c) => c + 1);
      setRecentRegistrations((prev) => [
        { name, time: new Date().toLocaleTimeString(), id: Date.now() },
        ...prev.slice(0, 6),
      ]);
    }, 4000);

    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [contract]);

  // Auto-redirect when election goes live
  useEffect(() => {
    if (!nextElection) return;
    const now = Math.floor(Date.now() / 1000);
    if (nextElection.startTime <= now) {
      navigate("/voter/dashboard");
    }
  }, [nextElection]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">

        {/* Welcome banner */}
        <div className="card border-accent border-opacity-40 mb-8 text-center py-8">
          <div className="w-16 h-16 rounded-full bg-accent bg-opacity-10 border border-accent border-opacity-30 flex items-center justify-center mx-auto mb-4">
            <span className="text-accent text-3xl">✓</span>
          </div>
          <h1 className="font-display font-black text-3xl mb-2">
            You're Registered, <span className="text-accent">{user?.fullName?.split(" ")[0]}</span>!
          </h1>
          <p className="text-muted">
            Your vote is secured on the blockchain. Wait for the election to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Countdown */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-accent">⏱</span> Next Election
            </h2>

            {loading && (
              <div className="card flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && nextElection && (
              <div className="card border-accent border-opacity-20 space-y-6">
                <div>
                  <h3 className="font-display font-bold text-xl text-white mb-1">{nextElection.title}</h3>
                  <p className="text-muted text-sm">{nextElection.description}</p>
                </div>
                <CountdownTimer endTime={nextElection.startTime} label="Voting opens in" />
                <CountdownTimer endTime={nextElection.endTime} label="Election closes in" />
                <div className="flex items-center gap-2 text-xs text-muted font-mono bg-surface border border-border rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  You will be redirected automatically when voting opens
                </div>
              </div>
            )}

            {!loading && !nextElection && (
              <div className="card text-center py-12">
                <p className="text-muted">No upcoming elections scheduled</p>
                <button onClick={() => navigate("/voter/dashboard")} className="btn-primary mt-4">
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Live registrations ticker */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-accent">◉</span> Registrations
              <span className="font-mono text-accent text-base">{registeredCount}</span>
            </h2>

            <div className="card space-y-3 min-h-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <p className="text-xs font-mono text-muted uppercase tracking-widest">Live — voters joining</p>
              </div>

              {recentRegistrations.length === 0 && (
                <div className="text-center text-muted text-sm py-8">
                  Waiting for registrations...
                </div>
              )}

              <div className="space-y-2">
                {recentRegistrations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-3 py-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-white text-sm font-mono">{r.name}</span>
                    </div>
                    <span className="text-muted text-xs font-mono">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QR shortcut */}
            <div className="card mt-4 border-border text-center">
              <p className="text-muted text-xs font-mono uppercase tracking-widest mb-4">Share registration QR</p>
              <QRDisplay
                value={`${window.location.origin}/qr?action=voter-register`}
                size={120}
                label="Voter Registration"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
