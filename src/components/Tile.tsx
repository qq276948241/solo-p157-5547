import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Tile as TileType } from '@/utils/gameUtils';
import { getCatLevel } from '@/data/catLevels';

interface TileProps {
  tile: TileType;
  cellSize: number;
  gap: number;
}

export default function Tile({ tile, cellSize, gap }: TileProps) {
  const cat = getCatLevel(tile.level);
  const size = cellSize - gap * 2;

  return (
    <div
      className={twMerge(
        'absolute flex flex-col items-center justify-center rounded-md',
        'border-2 border-b-4 border-r-4 shadow-[2px_2px_0_rgba(0,0,0,0.15)]',
        'transition-[transform,left,top] duration-120 ease-out',
        tile.isNew && 'animate-tile-pop',
        tile.isMerged && 'animate-tile-merge'
      )}
      style={{
        width: size,
        height: size,
        left: tile.col * cellSize + gap,
        top: tile.row * cellSize + gap,
        backgroundColor: cat.color,
        color: cat.textColor,
        borderColor: shadeColor(cat.color, -25),
      }}
    >
      <span
        className="leading-none"
        style={{ fontSize: Math.max(size * 0.45, 14) }}
      >
        {cat.emoji}
      </span>
      <span
        className="font-pixel font-bold mt-0.5 leading-none"
        style={{
          fontSize: Math.max(size * 0.14, 8),
          color: cat.textColor,
          textShadow: tile.level >= 3 ? '0 1px 0 rgba(0,0,0,0.2)' : 'none',
        }}
      >
        Lv.{tile.level}
      </span>
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
