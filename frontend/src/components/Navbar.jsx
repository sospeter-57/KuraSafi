import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWeb3 } from "../context/Web3Context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { account, isConnected, connectWallet, disconnect } = useWeb3();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnect();
    navigate("/");
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  const roleColor = {
    admin: "text-gold",
    candidate: "text-accent",
    voter: "text-blue-400",
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-ink bg-opacity-90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-ink text-sm font-bold font-display">K</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Kura <span className="text-accent">Safi</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <span className={`text-xs font-mono uppercase tracking-widest ${roleColor[user.role] || "text-muted"}`}>
              {user.role}
            </span>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2 bg-panel border border-border rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono text-muted">{shortAddress}</span>
            </div>
          ) : (
            <button onClick={connectWallet} className="btn-secondary text-sm py-2 px-4">
              Connect Wallet
            </button>
          )}

          {user ? (
            <button onClick={handleLogout} className="text-muted hover:text-danger text-sm transition-colors">
              Logout
            </button>
          ) : (
            <Link to="/" className="text-muted hover:text-white text-sm transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
