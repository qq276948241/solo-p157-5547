import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CAT_LEVELS, getCatLevel } from '@/data/catLevels';
import { Lock } from 'lucide-react';

interface CollectionProps {
  unlockedCats: number[];
  newlyUnlocked: number | null;
}

export default function Collection({ unlockedCats, newlyUnlocked }: CollectionProps) {
  return (
    <div
      className="flex flex-col rounded-lg p-4 h-full"
      style={{
        backgroundColor: 'rgba(255, 248, 231, 0.85)',
        border: '4px solid rgba(93, 64, 55, 0.6)',
        boxShadow: '0 6px 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.4)',
        minHeight: 560,
      }}
    >
      <div className="text-center mb-3 pb-2 border-b-2 border-dashed border-amber-700/40">
        <h2 className="font-pixel text-lg text-amber-900 tracking-widest">📖 图鉴</h2>
        <div className="font-pixel text-[10px] text-amber-700 mt-1">
          {unlockedCats.length}/{CAT_LEVELS.length} 已收集
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {CAT_LEVELS.map((cat) => {
          const unlocked = unlockedCats.includes(cat.level);
          const isNew = newlyUnlocked === cat.level;
          return (
            <CatCard key={cat.level} level={cat.level} unlocked={unlocked} isNew={isNew} />
          );
        })}
      </div>
    </div>
  );
}

function CatCard({ level, unlocked, isNew }: { level: number; unlocked: boolean; isNew: boolean }) {
  const cat = getCatLevel(level);
  return (
    <div
      className={twMerge(
        'relative flex flex-col items-center justify-center p-2 rounded-md transition-all',
        'border-2 border-b-3 border-r-3',
        unlocked ? 'animate-none' : 'grayscale',
        isNew && 'animate-shine ring-2 ring-yellow-400 ring-offset-2 ring-offset-amber-50 scale-105'
      )}
      style={{
        backgroundColor: unlocked ? cat.color : '#9CA3AF',
        borderColor: unlocked ? shadeColor(cat.color, -30) : '#6B7280',
        minHeight: 80,
        boxShadow: unlocked ? '2px 2px 0 rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 font-pixel text-[9px] bg-yellow-400 text-amber-900 px-1.5 py-0.5 rounded border border-yellow-600 animate-bounce z-10">
          NEW!
        </div>
      )}
      <div
        className="leading-none"
        style={{ fontSize: 26, filter: unlocked ? 'none' : 'brightness(0.3)' }}
      >
        {unlocked ? cat.emoji : '❓'}
      </div>
      <div
        className="font-pixel mt-1 leading-none"
        style={{
          fontSize: 9,
          color: unlocked ? cat.textColor : '#374151',
        }}
      >
        {unlocked ? cat.name : '???'}
      </div>
      <div
        className="font-pixel mt-0.5 leading-none"
        style={{
          fontSize: 8,
          color: unlocked ? cat.textColor : '#4B5563',
          opacity: unlocked ? 0.85 : 1,
        }}
      >
        Lv.{level}
      </div>
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <Lock size={16} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function shadeColor(color: string, percent: number): string {
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}
