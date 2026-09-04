import React, { useEffect, useState } from "react";
import { useAirDefenseStore } from "./useAirDefenseStore";

export interface ComboMilestoneData {
  milestone: number;
  title: string;
  subtitle: string;
  tone: "gold" | "violet" | "rose" | "cyan" | "rainbow";
  id: number;
}

export const ComboSplashOverlay: React.FC = () => {
  const { combo, activeComboMilestone, comboBreakActive } = useAirDefenseStore();
  const [animatingMilestone, setAnimatingMilestone] = useState<ComboMilestoneData | null>(null);

  useEffect(() => {
    if (activeComboMilestone) {
      setAnimatingMilestone(activeComboMilestone);
      const timer = setTimeout(() => {
        setAnimatingMilestone(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeComboMilestone]);

  // Màu sắc theo Tone
  const getToneStyles = (tone: ComboMilestoneData["tone"]) => {
    switch (tone) {
      case "gold":
        return {
          badgeBorder: "border-amber-400/90 shadow-[0_0_50px_rgba(255,200,87,0.7)] bg-amber-950/80",
          textGlow: "text-[#ffc857] drop-shadow-[0_0_20px_rgba(255,200,87,0.9)]",
          subText: "text-amber-200",
          ringColor: "rgba(255,200,87,0.5)"
        };
      case "violet":
        return {
          badgeBorder: "border-violet-400/90 shadow-[0_0_60px_rgba(169,121,255,0.8)] bg-violet-950/80",
          textGlow: "text-[#c3a6ff] drop-shadow-[0_0_25px_rgba(195,166,255,1)]",
          subText: "text-violet-200",
          ringColor: "rgba(169,121,255,0.6)"
        };
      case "rose":
        return {
          badgeBorder: "border-rose-400/90 shadow-[0_0_70px_rgba(255,77,109,0.9)] bg-rose-950/85",
          textGlow: "text-[#ff4d6d] drop-shadow-[0_0_30px_rgba(255,77,109,1)]",
          subText: "text-rose-200",
          ringColor: "rgba(255,77,109,0.7)"
        };
      case "rainbow":
      case "cyan":
      default:
        return {
          badgeBorder: "border-cyan-300 shadow-[0_0_80px_rgba(85,244,255,1)] bg-cyan-950/85",
          textGlow: "text-cyan drop-shadow-[0_0_35px_rgba(85,244,255,1)]",
          subText: "text-cyan-100",
          ringColor: "rgba(85,244,255,0.8)"
        };
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-35 overflow-hidden flex items-center justify-center">
      {/* 1. COMBO MILESTONE SPLASH BADGE (Nảy giữa màn hình rồi trượt lên) */}
      {animatingMilestone && (() => {
        const styles = getToneStyles(animatingMilestone.tone);
        return (
          <div
            key={animatingMilestone.id}
            className="animate-combo-splash flex flex-col items-center justify-center text-center select-none"
          >
            {/* Holographic Shockwave Ring */}
            <div
              className="absolute size-48 sm:size-64 rounded-full border-2 animate-ping"
              style={{ borderColor: styles.ringColor }}
            />

            {/* Main Cyber Badge */}
            <div
              className={`relative px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl border-2 backdrop-blur-md ${styles.badgeBorder} flex flex-col items-center`}
            >
              <div className="flex items-center gap-2">
                <span className="animate-spin text-lg sm:text-xl">⚡</span>
                <p className="font-mono text-[10px] sm:text-xs font-extrabold tracking-[.3em] uppercase text-white">
                  MILESTONE REACHED // CHUỖI TÁC CHIẾN
                </p>
                <span className="animate-spin text-lg sm:text-xl">⚡</span>
              </div>

              <h1
                className={`font-display text-3xl sm:text-5xl font-black tracking-widest mt-1 ${styles.textGlow}`}
              >
                {animatingMilestone.title}
              </h1>

              <p className={`font-mono text-[10px] sm:text-xs font-semibold tracking-wider mt-1 ${styles.subText}`}>
                {animatingMilestone.subtitle}
              </p>

              {/* Bottom decorative tech ticks */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="h-1 w-6 rounded-full bg-white/80" />
                <span className="h-1 w-12 rounded-full bg-white" />
                <span className="h-1 w-6 rounded-full bg-white/80" />
              </div>
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
