import React, { useEffect, useState } from "react";

interface Props {
  visible: boolean;
  countdown: number;       // seconds remaining
  onConfirm: () => void;
  onCancel: () => void;
}

export const ShakeConfirmOverlay: React.FC<Props> = ({
  visible,
  countdown,
  onConfirm,
  onCancel,
}) => {
  const [ring, setRing] = useState(false);

  // Pulse ring animation trigger
  useEffect(() => {
    if (!visible) return;
    setRing(false);
    const t = setTimeout(() => setRing(true), 50);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Outer pulsing ring */}
      <div
        className={`absolute w-72 h-72 rounded-full border-4 border-[#E11D48] transition-all duration-700 ${
          ring ? "scale-110 opacity-30" : "scale-100 opacity-0"
        }`}
      />

      <div className="relative flex flex-col items-center gap-6 px-8 text-center">
        {/* Shake icon */}
        <div className="w-20 h-20 rounded-full bg-[#E11D48]/20 border-2 border-[#E11D48] flex items-center justify-center animate-pulse">
          <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
            {/* Phone body */}
            <rect x="12" y="6" width="16" height="28" rx="3" stroke="#E11D48" strokeWidth="2" />
            <rect x="15" y="9" width="10" height="16" rx="1" fill="#E11D48" opacity="0.2" />
            {/* Shake lines */}
            <line x1="4" y1="14" x2="8" y2="14" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="20" x2="9" y2="20" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="26" x2="8" y2="26" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="14" x2="36" y2="14" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            <line x1="31" y1="20" x2="36" y2="20" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="26" x2="36" y2="26" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Headline */}
        <div>
          <p className="text-white font-mono font-bold text-lg uppercase tracking-widest">
            Shake Detected
          </p>
          <p className="text-zinc-400 font-mono text-xs mt-1 uppercase tracking-wider">
            Activating emergency protocol in
          </p>
        </div>

        {/* Countdown ring */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#374151" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="#E11D48"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 3)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="text-white font-mono font-bold text-3xl">{countdown}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 w-full max-w-xs">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 font-mono text-sm uppercase tracking-wider rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-[#E11D48] hover:bg-red-600 text-white font-mono text-sm font-bold uppercase tracking-wider rounded-xl transition-colors shadow-[0_0_20px_rgba(225,29,72,0.4)]"
          >
            Activate Now
          </button>
        </div>

        <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-wider">
          Good Samaritan Law 2016 — You are protected
        </p>
      </div>
    </div>
  );
};
