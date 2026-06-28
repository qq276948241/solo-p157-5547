import React from 'react';
import { getWallpaper } from '@/data/wallpapers';
import { getLevelConfig } from '@/data/levelConfig';

interface BackgroundProps {
  currentLevel: number;
  children: React.ReactNode;
}

export default function Background({ currentLevel, children }: BackgroundProps) {
  const config = getLevelConfig(currentLevel);
  const wp = getWallpaper(config.wallpaperIndex);

  return (
    <div
      className="min-h-screen w-full relative transition-all duration-700 ease-in-out"
      style={{ backgroundImage: wp.gradient }}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: wp.pattern }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23000' fill-opacity='1' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
