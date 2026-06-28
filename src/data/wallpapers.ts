export interface Wallpaper {
  id: number;
  name: string;
  gradient: string;
  pattern: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 0,
    name: '奶油草地',
    gradient: 'linear-gradient(135deg, #FFF8E7 0%, #FFE0B2 50%, #C8E6C9 100%)',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(255,183,77,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(129,199,132,0.3) 0%, transparent 50%)',
  },
  {
    id: 1,
    name: '暖阳橙橘',
    gradient: 'linear-gradient(135deg, #FFECB3 0%, #FFCC80 50%, #FFAB91 100%)',
    pattern: 'radial-gradient(circle at 30% 30%, rgba(255,213,79,0.4) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(255,138,101,0.3) 0%, transparent 40%)',
  },
  {
    id: 2,
    name: '樱花粉紫',
    gradient: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 50%, #E1BEE7 100%)',
    pattern: 'radial-gradient(circle at 15% 65%, rgba(244,143,177,0.4) 0%, transparent 45%), radial-gradient(circle at 85% 35%, rgba(206,147,216,0.35) 0%, transparent 45%)',
  },
  {
    id: 3,
    name: '星空夜蓝',
    gradient: 'linear-gradient(135deg, #1A237E 0%, #303F9F 50%, #5C6BC0 100%)',
    pattern: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.08) 1px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.06) 1px, transparent 2px), radial-gradient(circle at 50% 50%, rgba(121,134,203,0.3) 0%, transparent 60%)',
  },
  {
    id: 4,
    name: '海洋薄荷',
    gradient: 'linear-gradient(135deg, #B2EBF2 0%, #80DEEA 50%, #A5D6A7 100%)',
    pattern: 'radial-gradient(circle at 40% 80%, rgba(77,208,225,0.35) 0%, transparent 50%), radial-gradient(circle at 60% 20%, rgba(165,214,167,0.35) 0%, transparent 50%)',
  },
  {
    id: 5,
    name: '森林翠绿',
    gradient: 'linear-gradient(135deg, #C8E6C9 0%, #81C784 50%, #AED581 100%)',
    pattern: 'radial-gradient(circle at 20% 30%, rgba(102,187,106,0.4) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(174,213,129,0.35) 0%, transparent 45%)',
  },
];

export function getWallpaper(index: number): Wallpaper {
  return WALLPAPERS[index % WALLPAPERS.length];
}
