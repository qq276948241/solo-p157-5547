export interface LevelConfig {
  level: number;
  targetScore: number;
  wallpaperIndex: number;
  title: string;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, targetScore: 200, wallpaperIndex: 0, title: '新手草地' },
  { level: 2, targetScore: 500, wallpaperIndex: 1, title: '阳光屋顶' },
  { level: 3, targetScore: 1000, wallpaperIndex: 2, title: '樱花庭院' },
  { level: 4, targetScore: 2000, wallpaperIndex: 3, title: '星空夜晚' },
  { level: 5, targetScore: 4000, wallpaperIndex: 4, title: '海边沙滩' },
  { level: 6, targetScore: 8000, wallpaperIndex: 5, title: '森林秘境' },
  { level: 7, targetScore: 15000, wallpaperIndex: 0, title: '彩虹云端' },
  { level: 8, targetScore: 30000, wallpaperIndex: 1, title: '极光之巅' },
  { level: 9, targetScore: 60000, wallpaperIndex: 2, title: '糖果王国' },
  { level: 10, targetScore: 120000, wallpaperIndex: 3, title: '神猫殿堂' },
];

export function getLevelConfig(level: number): LevelConfig {
  const idx = Math.min(Math.max(level - 1, 0), LEVEL_CONFIGS.length - 1);
  return LEVEL_CONFIGS[idx];
}

export const TOTAL_LEVELS = LEVEL_CONFIGS.length;
