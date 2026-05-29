import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import QRDisplay from "../../components/QRDisplay";

export default function AdminQRCodes() {
  const navigate = useNavigate();
  const base = window.location.origin;

  const codes = [
    {
      label: "Voter Registration",
      url: `${base}/qr?action=voter-register`,
      desc: "Display at registration desk for new voters",
      color: "border-accent border-opacity-30",
      accent: "text-accent",
    },
    {
      label: "Voter Login / Vote",
      url: `${base}/qr?action=voter-login`,
      desc: "Display at voting station for registered voters",
      color: "border-green-400 border-opacity-30",
      accent: "text-green-400",
    },
    {
      label: "Candidate Registration",
      url: `${base}/qr?action=candidate-register`,
      desc: "Display for candidates to self-register",
      color: "border-blue-400 border-opacity-30",
      accent: "text-blue-400",
    },
    {
      label: "Candidate Login",
      url: `${base}/qr?action=candidate-login`,
      desc: "Display for candidates to view their dashboard",
      color: "border-purple-400 border-opacity-30",
      accent: "text-purple-400",
    },
  ];

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <button onClick={() => navigate("/admin/dashboard")} className="text-muted hover:text-white text-sm mb-3 block transition-colors">
              ← Back
            </button>
            <h1 className="font-display font-black text-3xl mb-1">QR Codes</h1>
            <p className="text-muted">Print or display these at the venue for participants to scan</p>
          </div>
          <button onClick={handlePrint} className="btn-primary">
            🖨 Print All QR Codes
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {codes.map((code) => (
            <div key={code.label} className={`card ${code.color} text-center`}>
              <h3 className={`font-display font-bold text-lg mb-1 ${code.accent}`}>{code.label}</h3>
              <p className="text-muted text-xs mb-6">{code.desc}</p>
              <div className="flex justify-center mb-4">
                <QRDisplay value={code.url} size={180} />
              </div>
              <p className="text-muted text-[10px] font-mono break-all mt-2">{code.url}</p>
            </div>
          ))}
        </div>

        <div className="card mt-8 border-gold border-opacity-20">
          <h3 className="font-display font-bold text-lg text-gold mb-2">How to use</h3>
          <ul className="text-muted text-sm space-y-2 list-disc list-inside">
            <li>Print QR codes and place them at the appropriate stations</li>
            <li>Voters scan the <span className="text-accent">Voter Registration</span> QR first to register</li>
            <li>Once registered, voters scan the <span className="text-accent">Voter Login</span> QR to authenticate and vote</li>
            <li>Candidates use the <span className="text-blue-400">Candidate Registration</span> QR to register</li>
            <li>Each QR simply opens the correct page — no special app needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
