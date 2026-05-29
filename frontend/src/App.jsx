import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import LiveTally from "./pages/LiveTally";
import QREntry from "./pages/QREntry";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCandidates from "./pages/admin/ManageCandidates";
import AdminQRCodes from "./pages/admin/AdminQRCodes";

// Voter
import VoterLogin from "./pages/voter/VoterLogin";
import VoterRegister from "./pages/voter/VoterRegister";
import VoterDashboard from "./pages/voter/VoterDashboard";
import ElectionWaiting from "./pages/voter/ElectionWaiting";

// Candidate
import CandidateLogin from "./pages/candidate/CandidateLogin";
import CandidateRegister from "./pages/candidate/CandidateRegister";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";

export default function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/qr" element={<QREntry />} />
            <Route path="/tally" element={<LiveTally />} />
            <Route path="/tally/:electionId" element={<LiveTally />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/election/:electionId/candidates" element={
              <ProtectedRoute role="admin"><ManageCandidates /></ProtectedRoute>
            } />
            <Route path="/admin/qrcodes" element={
              <ProtectedRoute role="admin"><AdminQRCodes /></ProtectedRoute>
            } />

            {/* Voter */}
            <Route path="/voter/login" element={<VoterLogin />} />
            <Route path="/voter/register" element={<VoterRegister />} />
            <Route path="/voter/waiting" element={
              <ProtectedRoute role="voter"><ElectionWaiting /></ProtectedRoute>
            } />
            <Route path="/voter/dashboard" element={
              <ProtectedRoute role="voter"><VoterDashboard /></ProtectedRoute>
            } />

            {/* Candidate */}
            <Route path="/candidate/login" element={<CandidateLogin />} />
            <Route path="/candidate/register" element={<CandidateRegister />} />
            <Route path="/candidate/dashboard" element={
              <ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Web3Provider>
    </AuthProvider>
  );
}
