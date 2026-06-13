import React from "react";

interface Props {
  step: number;
  victimType: "adult" | "pregnant" | "child" | "infant";
  emergencyType: string;
}

const STEP_COLORS: Record<string, string> = {
  severe: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  success: "#10B981",
};

// Simple SVG illustrations for each step — works fully offline, no external assets
const illustrations: Record<number, React.FC<{ victimType: string }>> = {
  1: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Road */}
      <rect x="0" y="55" width="280" height="30" fill="#374151" rx="2" />
      <rect x="120" y="67" width="40" height="4" fill="#FCD34D" rx="1" />
      {/* Warning triangle */}
      <polygon points="140,10 110,55 170,55" fill="none" stroke="#EF4444" strokeWidth="3" />
      <text x="140" y="45" textAnchor="middle" fill="#EF4444" fontSize="18" fontWeight="bold">!</text>
      {/* Person standing back */}
      <circle cx="40" cy="35" r="8" fill="#9CA3AF" />
      <line x1="40" y1="43" x2="40" y2="60" stroke="#9CA3AF" strokeWidth="3" />
      <line x1="40" y1="48" x2="28" y2="55" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="40" y1="48" x2="52" y2="55" stroke="#9CA3AF" strokeWidth="2" />
      {/* Arrow showing to stay back */}
      <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9">CHECK: No traffic · No fire · No fuel leak</text>
    </svg>
  ),
  2: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Ground */}
      <rect x="60" y="70" width="160" height="4" fill="#374151" rx="2" />
      {/* Victim lying down */}
      <ellipse cx="160" cy="68" rx="50" ry="8" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />
      <circle cx="205" cy="60" r="9" fill="#9CA3AF" />
      {/* Helper kneeling */}
      <circle cx="95" cy="48" r="8" fill="#60A5FA" />
      <line x1="95" y1="56" x2="95" y2="68" stroke="#60A5FA" strokeWidth="3" />
      {/* Hand reaching */}
      <line x1="95" y1="62" x2="120" y2="65" stroke="#60A5FA" strokeWidth="2" />
      {/* Speech bubble */}
      <rect x="50" y="22" width="90" height="20" fill="#1F2937" stroke="#60A5FA" strokeWidth="1" rx="4" />
      <text x="95" y="35" textAnchor="middle" fill="#93C5FD" fontSize="8">Can you hear me?</text>
      <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9">Gentle tap · No shaking · Listen for response</text>
    </svg>
  ),
  3: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Phone */}
      <rect x="110" y="15" width="60" height="55" rx="8" fill="#1F2937" stroke="#EF4444" strokeWidth="2" />
      <rect x="116" y="22" width="48" height="35" rx="2" fill="#0D1117" />
      <text x="140" y="42" textAnchor="middle" fill="#EF4444" fontSize="16" fontWeight="bold">112</text>
      <text x="140" y="52" textAnchor="middle" fill="#6B7280" fontSize="7">EMERGENCY</text>
      <circle cx="140" cy="62" r="4" fill="#374151" />
      {/* Signal waves */}
      <path d="M170,30 Q180,30 180,40" fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.6" />
      <path d="M170,25 Q190,25 190,40" fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.4" />
      <path d="M170,20 Q200,20 200,40" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.2" />
      <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9">State GPS · Vehicle no. · Casualty count</text>
    </svg>
  ),
  4: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Victim lying */}
      <ellipse cx="140" cy="62" rx="60" ry="10" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />
      <circle cx="195" cy="52" r="10" fill="#9CA3AF" />
      {/* Spine indicator */}
      <line x1="135" y1="62" x2="190" y2="62" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4 2" />
      <text x="160" y="52" textAnchor="middle" fill="#FCD34D" fontSize="8">SPINE</text>
      {/* Big X / No symbol */}
      <circle cx="80" cy="45" r="20" fill="none" stroke="#EF4444" strokeWidth="3" />
      <line x1="66" y1="31" x2="94" y2="59" stroke="#EF4444" strokeWidth="3" />
      <text x="80" y="78" textAnchor="middle" fill="#EF4444" fontSize="8">DO NOT MOVE</text>
      <text x="185" y="90" textAnchor="middle" fill="#6B7280" fontSize="9">Unless fire · Support neck · Keep still</text>
    </svg>
  ),
  5: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Victim */}
      <ellipse cx="140" cy="65" rx="55" ry="9" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />
      <circle cx="190" cy="55" r="10" fill="#9CA3AF" />
      {/* Chest rise animation hint */}
      <ellipse cx="140" cy="58" rx="25" ry="7" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 2" />
      <text x="140" y="55" textAnchor="middle" fill="#93C5FD" fontSize="8">CHEST</text>
      {/* Eye watching */}
      <ellipse cx="80" cy="40" rx="16" ry="10" fill="#1F2937" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="80" cy="40" r="5" fill="#3B82F6" />
      <circle cx="82" cy="38" r="2" fill="#93C5FD" />
      {/* Timer */}
      <text x="80" y="70" textAnchor="middle" fill="#6B7280" fontSize="9">10 sec</text>
      <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9">Watch · Listen · Feel for breath on cheek</text>
    </svg>
  ),
  6: ({ victimType }) => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Victim lying */}
      <ellipse cx="150" cy="68" rx="55" ry="9" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />
      <circle cx="200" cy="58" r="10" fill="#9CA3AF" />
      {/* Hands pressing chest */}
      <rect x="125" y="48" width="30" height="18" rx="4" fill="#60A5FA" opacity="0.8" />
      <text x="140" y="61" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PRESS</text>
      {/* Depth arrows */}
      <line x1="165" y1="50" x2="165" y2="65" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow)" />
      {/* BPM indicator */}
      <text x="65" y="40" textAnchor="middle" fill="#EF4444" fontSize="14" fontWeight="bold">
        {victimType === "infant" ? "120" : victimType === "child" ? "115" : "110"}
      </text>
      <text x="65" y="52" textAnchor="middle" fill="#9CA3AF" fontSize="8">BPM</text>
      {/* Depth */}
      <text x="65" y="70" textAnchor="middle" fill="#9CA3AF" fontSize="8">
        {victimType === "infant" ? "4cm · 2 fingers" : victimType === "child" ? "4-5cm · 1 hand" : victimType === "pregnant" ? "5-6cm + tilt" : "5-6cm · 2 hands"}
      </text>
      <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9">Centre chest · Arms straight · Full recoil</text>
    </svg>
  ),
  7: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Arm with wound */}
      <rect x="80" y="45" width="120" height="25" rx="12" fill="#374151" />
      {/* Blood spot */}
      <circle cx="165" cy="57" r="10" fill="#7F1D1D" opacity="0.8" />
      {/* Cloth pressing */}
      <rect x="150" y="44" width="30" height="26" rx="3" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="2" />
      {/* Pressure arrows */}
      <line x1="165" y1="35" x2="165" y2="44" stroke="#EF4444" strokeWidth="3" />
      <polygon points="165,44 160,36 170,36" fill="#EF4444" />
      <text x="165" y="30" textAnchor="middle" fill="#EF4444" fontSize="9" fontWeight="bold">PRESS FIRM</text>
      <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9">Do NOT remove cloth · Keep pressing · Tourniquet only if spurting</text>
    </svg>
  ),
  8: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Victim covered */}
      <ellipse cx="140" cy="65" rx="60" ry="9" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />
      <circle cx="195" cy="54" r="10" fill="#9CA3AF" />
      {/* Blanket/jacket */}
      <rect x="82" y="56" width="116" height="18" rx="5" fill="#7C3AED" opacity="0.6" stroke="#8B5CF6" strokeWidth="1" />
      {/* Warmth indicator */}
      <text x="55" y="45" textAnchor="middle" fill="#F59E0B" fontSize="16">☀</text>
      <text x="55" y="58" textAnchor="middle" fill="#9CA3AF" fontSize="8">WARM</text>
      <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9">Cover · No food/water · Talk calmly · Keep still</text>
    </svg>
  ),
  9: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Centre victim */}
      <circle cx="140" cy="55" r="12" fill="#374151" stroke="#EF4444" strokeWidth="2" />
      {/* Crowd dots */}
      {[50, 80, 100, 170, 200, 220, 60, 220].map((x, i) => (
        <circle key={i} cx={x} cy={i < 6 ? 45 : 68} r="7" fill="#4B5563" />
      ))}
      {/* Back arrows pushing crowd */}
      <line x1="115" y1="52" x2="88" y2="48" stroke="#60A5FA" strokeWidth="2" />
      <polygon points="88,48 96,44 94,52" fill="#60A5FA" />
      <line x1="165" y1="52" x2="192" y2="48" stroke="#60A5FA" strokeWidth="2" />
      <polygon points="192,48 184,44 186,52" fill="#60A5FA" />
      {/* 3m label */}
      <text x="140" y="82" textAnchor="middle" fill="#60A5FA" fontSize="9">← 3 metres →</text>
      <text x="140" y="95" textAnchor="middle" fill="#6B7280" fontSize="9">Assign roles · Guide ambulance · Fresh air</text>
    </svg>
  ),
  10: () => (
    <svg viewBox="0 0 280 100" className="w-full max-w-xs mx-auto opacity-80">
      {/* Ambulance */}
      <rect x="160" y="40" width="80" height="35" rx="4" fill="#1D9E75" opacity="0.8" />
      <rect x="155" y="48" width="20" height="27" rx="3" fill="#1D9E75" opacity="0.6" />
      <circle cx="172" cy="77" r="6" fill="#374151" stroke="#9CA3AF" strokeWidth="2" />
      <circle cx="224" cy="77" r="6" fill="#374151" stroke="#9CA3AF" strokeWidth="2" />
      <text x="200" y="62" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">+</text>
      {/* Person waiting */}
      <circle cx="90" cy="42" r="9" fill="#60A5FA" />
      <line x1="90" y1="51" x2="90" y2="70" stroke="#60A5FA" strokeWidth="3" />
      <line x1="90" y1="57" x2="78" y2="65" stroke="#60A5FA" strokeWidth="2" />
      <line x1="90" y1="57" x2="102" y2="65" stroke="#60A5FA" strokeWidth="2" />
      {/* Shield badge */}
      <path d="M85,20 L95,20 L95,30 L90,33 L85,30 Z" fill="#1D9E75" opacity="0.8" />
      <text x="90" y="29" textAnchor="middle" fill="white" fontSize="8">✓</text>
      <text x="140" y="92" textAnchor="middle" fill="#1D9E75" fontSize="9">You are protected · Brief the paramedics · Report ready</text>
    </svg>
  ),
};

export const OfflineIllustrations: React.FC<Props> = ({ step, victimType }) => {
  const Illustration = illustrations[step] || illustrations[1];
  return (
    <div className="w-full bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-center min-h-[110px]">
      <Illustration victimType={victimType} />
    </div>
  );
};
