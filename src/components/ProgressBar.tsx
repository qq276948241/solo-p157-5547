import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getLevelConfig, TOTAL_LEVELS } from '@/data/levelConfig';

export default function ProgressBar() {
  const currentLevel = useGameStore((s) => s.currentLevel);
  const currentLevelScore = useGameStore((s) => s.currentLevelScore);
  const config = getLevelConfig(currentLevel);

  const percent = Math.min(100, (currentLevelScore / config.targetScore) * 100);
  const filled = Math.floor(percent / 5);

  return (
    <div
      className="w-full rounded-lg px-5 py-3"
      style={{
        backgroundColor: 'rgba(255, 248, 231, 0.9)',
        border: '4px solid rgba(93, 64, 55, 0.6)',
        boxShadow: '0 6px 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-pixel text-sm text-amber-900 tracking-wide">
          关卡 {currentLevel}/{TOTAL_LEVELS}
        </div>
        <div className="font-pixel text-sm text-amber-800">
          🎯 {config.title}
        </div>
        <div className="font-pixel text-xs text-amber-700 tabular-nums">
          {currentLevelScore.toLocaleString()} / {config.targetScore.toLocaleString()}
        </div>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="h-5 flex-1 rounded-sm border-2 transition-all duration-300"
            style={{
              backgroundColor: i < filled
                ? `hsl(${120 - percent * 0.8}, 70%, ${55 - i * 0.5}%)`
                : 'rgba(93, 64, 55, 0.15)',
              borderColor: i < filled
                ? `hsl(${120 - percent * 0.8}, 60%, 35%)`
                : 'rgba(93, 64, 55, 0.3)',
              boxShadow: i < filled
                ? 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.15)'
                : 'none',
              animation: i === filled - 1 && percent < 100 ? 'pulse 0.8s ease-in-out infinite' : 'none',
            }}
          />
        ))}
      </div>

      <div className="mt-2 font-pixel text-[10px] text-amber-700/80 text-center">
        ↑ ↑ ↓ ↓ ← → ← → 合并相同等级的猫咪来升级获得分数吧！
      </div>
    </div>
  );
}
