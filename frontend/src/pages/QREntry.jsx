import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QRScanner from "../components/QRScanner";

// This page is the landing for QR scans.
// QR codes encode URLs like:
//   /qr?action=voter-register
//   /qr?action=voter-login
//   /qr?action=candidate-register
// The admin can display these QR codes at the venue.
export default function QREntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [manualScan, setManualScan] = useState(false);

  const action = searchParams.get("action");

  useEffect(() => {
    if (!action) return;
    const routes = {
      "voter-register": "/voter/register",
      "voter-login": "/voter/login",
      "candidate-register": "/candidate/register",
      "candidate-login": "/candidate/login",
    };
    const dest = routes[action];
    if (dest) {
      setTimeout(() => navigate(dest), 800);
    }
  }, [action]);

  const handleScan = (text) => {
    try {
      const url = new URL(text);
      navigate(url.pathname + url.search);
    } catch {
      // If not a full URL, treat as path
      navigate(text);
    }
  };

  if (action) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-accent font-mono text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(42,42,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(42,42,58,0.2)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent bg-opacity-10 border border-accent border-opacity-30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📷</span>
          </div>
          <h1 className="font-display font-black text-3xl mb-2">
            Scan <span className="text-accent">QR Code</span>
          </h1>
          <p className="text-muted text-sm">Scan the QR code displayed at the voting venue</p>
        </div>

        <div className="card border-accent border-opacity-20">
          <QRScanner onScan={handleScan} label="Point camera at QR code" />

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-muted text-xs text-center mb-4">Or navigate directly</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate("/voter/register")} className="btn-secondary text-xs py-2">
                Voter Register
              </button>
              <button onClick={() => navigate("/voter/login")} className="btn-secondary text-xs py-2">
                Voter Login
              </button>
              <button onClick={() => navigate("/candidate/register")} className="btn-secondary text-xs py-2">
                Candidate Reg.
              </button>
              <button onClick={() => navigate("/candidate/login")} className="btn-secondary text-xs py-2">
                Candidate Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
