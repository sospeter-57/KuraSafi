import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "admin",
      title: "Admin",
      desc: "Manage elections, add candidates, monitor results",
      icon: "⚙",
      color: "border-gold hover:border-gold",
      accent: "text-gold",
      glow: "hover:shadow-[0_0_30px_rgba(245,200,66,0.2)]",
      login: "/admin/login",
    },
    {
      id: "voter",
      title: "Voter",
      desc: "Register, authenticate and cast your vote securely",
      icon: "✓",
      color: "border-accent hover:border-accent",
      accent: "text-accent",
      glow: "hover:shadow-[0_0_30px_rgba(0,229,160,0.2)]",
      login: "/voter/login",
      register: "/voter/register",
    },
    {
      id: "candidate",
      title: "Candidate",
      desc: "View your profile, track election results live",
      icon: "◈",
      color: "border-blue-400 hover:border-blue-400",
      accent: "text-blue-400",
      glow: "hover:shadow-[0_0_30px_rgba(96,165,250,0.2)]",
      login: "/candidate/login",
      register: "/candidate/register",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(42,42,58,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(42,42,58,0.3)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full opacity-[0.04] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold rounded-full opacity-[0.04] blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-panel border border-border rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-muted uppercase tracking-widest">Blockchain Powered</span>
          </div>
          <h1 className="text-6xl font-display font-black mb-4 leading-none">
            Kura <span className="text-accent">Safi</span>
          </h1>
          <p className="text-muted text-lg max-w-md mx-auto leading-relaxed">
            Transparent, tamper-resistant digital elections secured by Ethereum smart contracts.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((r) => (
            <div
              key={r.id}
              className={`card border ${r.color} transition-all duration-300 ${r.glow} group`}
            >
              <div className={`text-4xl mb-4 ${r.accent}`}>{r.icon}</div>
              <h3 className={`font-display text-xl font-bold mb-2 ${r.accent}`}>{r.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">{r.desc}</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate(r.login)} className="btn-secondary text-sm py-2">
                  Login
                </button>
                {r.register && (
                  <button onClick={() => navigate(r.register)} className="btn-primary text-sm py-2">
                    Register
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live tally link */}
        <div className="text-center">
          <button
            onClick={() => navigate("/tally")}
            className="inline-flex items-center gap-2 text-muted hover:text-accent text-sm transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            View Live Election Tally
          </button>
        </div>
      </div>
    </div>
  );
}
