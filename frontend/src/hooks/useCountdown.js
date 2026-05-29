import { useState, useEffect } from "react";

export function useCountdown(targetTimestamp) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetTimestamp));

  function getTimeLeft(ts) {
    const diff = Math.max(0, ts * 1000 - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      total: diff,
      ended: diff === 0,
    };
  }

  useEffect(() => {
    if (!targetTimestamp) return;
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetTimestamp)), 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  return timeLeft;
}
