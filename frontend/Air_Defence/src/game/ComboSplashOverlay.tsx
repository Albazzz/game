import React, { useEffect, useState } from "react";
import { useAirDefenseStore } from "./useAirDefenseStore";

export interface ComboMilestoneData {
  milestone: number;
  title: string;
  subtitle: string;
  tone: "gold" | "violet" | "rose" | "cyan" | "rainbow";
  id: number;
  x?: number;
  y?: number;
}

export const ComboSplashOverlay: React.FC = () => {
  const { combo, activeComboMilestone, comboBreakActive } = useAirDefenseStore();
  const [animatingMilestone, setAnimatingMilestone] = useState<ComboMilestoneData | null>(null);

  useEffect(() => {
    if (activeComboMilestone) {
      setAnimatingMilestone(activeComboMilestone);
      const timer = setTimeout(() => {
        setAnimatingMilestone(null);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [activeComboMilestone?.id]);

  // Màu sắc theo Tone
  const getToneStyles = (tone: ComboMilestoneData["tone"]) => {
    switch (tone) {
      case "gold":
        return {
          badgeBorder: "border-amber-400/90 shadow-[0_0_35px_rgba(255,200,87,0.7)] bg-amber-950/90",
          textGlow: "text-[#ffc857] drop-shadow-[0_0_15px_rgba(255,200,87,0.9)]",
          subText: "text-amber-200"
        };
      case "violet":
        return {
          badgeBorder: "border-violet-400/90 shadow-[0_0_35px_rgba(169,121,255,0.8)] bg-violet-950/90",
          textGlow: "text-[#c3a6ff] drop-shadow-[0_0_18px_rgba(195,166,255,1)]",
          subText: "text-violet-200"
        };
      case "rose":
        return {
          badgeBorder: "border-rose-400/90 shadow-[0_0_40px_rgba(255,77,109,0.9)] bg-rose-950/90",
          textGlow: "text-[#ff4d6d] drop-shadow-[0_0_20px_rgba(255,77,109,1)]",
          subText: "text-rose-200"
        };
      case "rainbow":
      case "cyan":
      default:
        return {
          badgeBorder: "border-cyan-300 shadow-[0_0_40px_rgba(85,244,255,1)] bg-cyan-950/90",
          textGlow: "text-cyan drop-shadow-[0_0_25px_rgba(85,244,255,1)]",
          subText: "text-cyan-100"
        };
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-35 overflow-hidden">
      {/* 1. LOCAL ENEMY DESTROYED COMBO POPUP BADGE (Nảy ngay tại vị trí quái bị bắn nổ) */}
      {animatingMilestone && (() => {
        const styles = getToneStyles(animatingMilestone.tone);
        const posX = animatingMilestone.x ?? 50;
        const posY = Math.max(10, Math.min(85, animatingMilestone.y ?? 35));
        return (
          <div
            key={`local-${animatingMilestone.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-enemy-combo-pop z-40 pointer-events-none"
            style={{
              left: `${posX}%`,
              top: `${posY}%`
            }}
          >
            <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 backdrop-blur-md shadow-[0_0_35px_rgba(255,255,255,0.5)] ${styles.badgeBorder} flex items-center gap-2 whitespace-nowrap`}>
              <span className="text-base sm:text-lg animate-bounce">⚡</span>
              <div className="flex flex-col items-center">
                <span className={`font-display text-sm sm:text-base font-black tracking-wider ${styles.textGlow}`}>
                  {animatingMilestone.title}
                </span>
                {animatingMilestone.subtitle ? (
                  <span className={`font-mono text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest ${styles.subText}`}>
                    {animatingMilestone.subtitle}
                  </span>
                ) : (
                  <span className="font-mono text-[8px] font-extrabold text-white uppercase tracking-widest">
                    +100% COMBO BONUS
                  </span>
                )}
              </div>
              <span className="text-base sm:text-lg animate-bounce">⚡</span>
            </div>
          </div>
        );
      })()}

      {/* 2. COMBO BREAK OVERHEAT NOTIFICATION (Chớp nhẹ khi đứt chuỗi lớn) */}
      {comboBreakActive && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-combo-break px-4 py-1.5 rounded-full border border-rose-500/80 bg-black/80 backdrop-blur text-center shadow-[0_0_20px_rgba(255,51,102,0.6)]">
          <p className="font-mono text-xs font-bold text-rose-400 tracking-widest uppercase">
            ⚡ ĐỨT CHUỖI COMBO // HỒI PHỤC LÒ PHẢN ỨNG ⚡
          </p>
        </div>
      )}

      {/* 3. SUBTLE AMBIENT HUD COMBO FLARE (Khi combo >= 10) */}
      {combo >= 10 && (
        <div
          className={`absolute top-2 right-4 transition-opacity duration-300 font-mono text-xs font-extrabold flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur ${
            combo >= 30
              ? "border-cyan-300 bg-cyan-950/60 text-cyan shadow-[0_0_20px_rgba(85,244,255,0.7)] animate-pulse"
              : combo >= 20
              ? "border-rose-400 bg-rose-950/60 text-rose-300 shadow-[0_0_18px_rgba(255,77,109,0.6)]"
              : combo >= 10
              ? "border-violet-400 bg-violet-950/60 text-violet-200 shadow-[0_0_15px_rgba(169,121,255,0.5)]"
              : "border-amber-400 bg-amber-950/60 text-amber-200 shadow-[0_0_12px_rgba(255,200,87,0.4)]"
          }`}
        >
          <span>🔥</span>
          <span>STREAK ×{combo}</span>
        </div>
      )}
    </div>
  );
};
