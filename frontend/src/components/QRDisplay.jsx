import React from "react";
import QRCode from "react-qr-code";

export default function QRDisplay({ value, label, size = 160 }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-4 rounded-xl">
        <QRCode value={value} size={size} />
      </div>
      {label && (
        <p className="text-muted text-xs font-mono uppercase tracking-widest text-center">{label}</p>
      )}
    </div>
  );
}
