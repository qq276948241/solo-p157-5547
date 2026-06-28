import React from 'react';
import { Trophy, Star, Zap } from 'lucide-react';

interface ScorePanelProps {
  score: number;
  bestScore: number;
  currentLevel: number;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="flex-1 rounded-md px-3 py-2 flex items-center gap-2"
      style={{
        backgroundColor: 'rgba(255, 248, 231, 0.9)',
        border: `3px solid ${color}`,
        boxShadow: '0 3px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <div style={{ color }}>{icon}</div>
      <div className="flex flex-col leading-tight min-w-0">
        <span className="font-pixel text-[9px] text-amber-800 uppercase tracking-wider">{label}</span>
        <span className="font-pixel text-sm text-amber-900 tabular-nums truncate">{value}</span>
      </div>
    </div>
  );
}

export default function ScorePanel({ score, bestScore, currentLevel }: ScorePanelProps) {
  return (
    <div className="flex gap-2 w-full">
      <StatCard
        icon={<Zap size={18} strokeWidth={2.5} />}
        label="分数"
        value={score.toLocaleString()}
        color="#F59E0B"
      />
      <StatCard
        icon={<Trophy size={18} strokeWidth={2.5} />}
        label="最高"
        value={bestScore.toLocaleString()}
        color="#EF4444"
      />
      <StatCard
        icon={<Star size={18} strokeWidth={2.5} />}
        label="关卡"
        value={`第${currentLevel}关`}
        color="#8B5CF6"
      />
    </div>
  );
}
