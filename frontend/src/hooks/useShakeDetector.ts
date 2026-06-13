import { useEffect, useRef, useCallback } from "react";

interface ShakeOptions {
  threshold?: number;      // acceleration delta m/s² to count as shake — default 15
  shakesRequired?: number; // impulses needed within timeWindow — default 4
  timeWindow?: number;     // ms within which shakes must occur — default 800
  cooldown?: number;       // ms before shake can trigger again — default 5000
  enabled?: boolean;
}

export function useShakeDetector(
  onShake: () => void,
  options: ShakeOptions = {}
) {
  const {
    threshold = 15,
    shakesRequired = 4,
    timeWindow = 800,
    cooldown = 5000,
    enabled = true,
  } = options;

  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const shakeTimestamps = useRef<number[]>([]);
  const lastTrigger = useRef<number>(0);

  const handleMotion = useCallback(
    (e: DeviceMotionEvent) => {
      if (!enabled) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

      const dx = Math.abs(acc.x - lastAccel.current.x);
      const dy = Math.abs(acc.y - lastAccel.current.y);
      const dz = Math.abs(acc.z - lastAccel.current.z);
      lastAccel.current = { x: acc.x!, y: acc.y!, z: acc.z! };

      if (dx > threshold || dy > threshold || dz > threshold) {
        const now = Date.now();
        if (now - lastTrigger.current < cooldown) return;

        shakeTimestamps.current.push(now);
        shakeTimestamps.current = shakeTimestamps.current.filter(
          (t) => now - t < timeWindow
        );

        if (shakeTimestamps.current.length >= shakesRequired) {
          lastTrigger.current = now;
          shakeTimestamps.current = [];
          onShake();
        }
      }
    },
    [enabled, threshold, shakesRequired, timeWindow, cooldown, onShake]
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.DeviceMotionEvent) return;

    const attach = async () => {
      try {
        // iOS 13+ requires explicit permission
        if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
          const perm = await (DeviceMotionEvent as any).requestPermission();
          if (perm !== "granted") return;
        }
        window.addEventListener("devicemotion", handleMotion, { passive: true });
      } catch {
        // Silently fail — desktop or permission denied
      }
    };

    attach();
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [enabled, handleMotion]);

  return { supported: typeof window !== "undefined" && !!window.DeviceMotionEvent };
}
