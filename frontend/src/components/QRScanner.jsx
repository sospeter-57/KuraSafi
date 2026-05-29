import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScan, onError, label = "Scan QR Code" }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const instanceRef = useRef(null);
  const scannedRef = useRef(false);

  const startScan = async () => {
    setError("");
    setScanning(true);
    scannedRef.current = false;

    try {
      const scanner = new Html5Qrcode(scannerRef.current.id);
      instanceRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (scannedRef.current) return;
          scannedRef.current = true;
          stopScan();
          onScan(decodedText);
        },
        () => {} // suppress frame errors
      );
    } catch (err) {
      setError("Camera access denied or unavailable");
      setScanning(false);
      if (onError) onError(err);
    }
  };

  const stopScan = async () => {
    try {
      if (instanceRef.current) {
        await instanceRef.current.stop();
        instanceRef.current = null;
      }
    } catch {}
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScan(); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-muted text-xs font-mono uppercase tracking-widest">{label}</p>

      {error && (
        <div className="bg-danger bg-opacity-10 border border-danger border-opacity-30 rounded-lg px-4 py-2 text-danger text-sm w-full text-center">
          {error}
        </div>
      )}

      <div
        id="qr-scanner-container"
        ref={scannerRef}
        className={`w-64 h-64 rounded-xl overflow-hidden border-2 transition-colors ${scanning ? "border-accent" : "border-border bg-surface flex items-center justify-center"}`}
      >
        {!scanning && (
          <div className="flex flex-col items-center gap-2 text-muted">
            <span className="text-4xl">📷</span>
            <span className="text-xs font-mono">Camera off</span>
          </div>
        )}
      </div>

      {!scanning ? (
        <button onClick={startScan} className="btn-primary px-8">
          Start Scanner
        </button>
      ) : (
        <button onClick={stopScan} className="btn-secondary px-8">
          Cancel
        </button>
      )}

      {scanning && (
        <p className="text-accent text-xs font-mono animate-pulse">Scanning...</p>
      )}
    </div>
  );
}
