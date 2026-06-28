export interface CatLevel {
  level: number;
  name: string;
  emoji: string;
  color: string;
  textColor: string;
  scoreValue: number;
}

export const CAT_LEVELS: CatLevel[] = [
  { level: 1, name: '奶猫', emoji: '😺', color: '#FFE5E5', textColor: '#8B4513', scoreValue: 2 },
  { level: 2, name: '橘猫', emoji: '😸', color: '#FFD4A3', textColor: '#8B4513', scoreValue: 4 },
  { level: 3, name: '黑猫', emoji: '🐱', color: '#3D3D3D', textColor: '#FFFFFF', scoreValue: 8 },
  { level: 4, name: '白猫', emoji: '😻', color: '#F5F5F5', textColor: '#333333', scoreValue: 16 },
  { level: 5, name: '三花', emoji: '😽', color: '#D4A574', textColor: '#4A3728', scoreValue: 32 },
  { level: 6, name: '狸花', emoji: '🙀', color: '#B8860B', textColor: '#FFFFFF', scoreValue: 64 },
  { level: 7, name: '布偶', emoji: '😿', color: '#E6D5F5', textColor: '#6B4C9A', scoreValue: 128 },
  { level: 8, name: '英短', emoji: '😾', color: '#B0C4DE', textColor: '#2F4F4F', scoreValue: 256 },
  { level: 9, name: '美短', emoji: '🙈', color: '#DEB887', textColor: '#5D4037', scoreValue: 512 },
  { level: 10, name: '暹罗', emoji: '🐈', color: '#8B7D6B', textColor: '#FFFEF0', scoreValue: 1024 },
  { level: 11, name: '波斯', emoji: '🐈‍⬛', color: '#DDA0DD', textColor: '#4B0082', scoreValue: 2048 },
  { level: 12, name: '神猫', emoji: '🦁', color: '#FFD700', textColor: '#8B0000', scoreValue: 4096 },
];

export const MAX_LEVEL = CAT_LEVELS.length;
export const UNLOCK_LEVEL = MAX_LEVEL;

export function getCatLevel(level: number): CatLevel {
  return CAT_LEVELS[Math.min(Math.max(level - 1, 0), MAX_LEVEL - 1)];
}
