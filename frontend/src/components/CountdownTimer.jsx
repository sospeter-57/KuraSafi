import React from "react";
import { useCountdown } from "../hooks/useCountdown";

export default function CountdownTimer({ endTime, label = "Election ends in" }) {
  const { days, hours, minutes, seconds, ended } = useCountdown(endTime);

  if (ended) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
        <span className="text-danger font-mono text-sm uppercase tracking-widest">Election Ended</span>
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="space-y-2">
      <p className="text-muted text-xs uppercase tracking-widest font-mono">{label}</p>
      <div className="flex items-center gap-2">
        {days > 0 && (
          <>
            <Segment value={pad(days)} label="Days" />
            <Colon />
          </>
        )}
        <Segment value={pad(hours)} label="Hrs" />
        <Colon />
        <Segment value={pad(minutes)} label="Min" />
        <Colon />
        <Segment value={pad(seconds)} label="Sec" />
      </div>
    </div>
  );
}

function Segment({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-panel border border-border rounded-lg w-14 h-14 flex items-center justify-center">
        <span className="font-mono font-bold text-xl text-accent">{value}</span>
      </div>
      <span className="text-muted text-[10px] mt-1 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function Colon() {
  return <span className="text-border font-mono text-xl mb-4">:</span>;
}
