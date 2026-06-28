import React, { useCallback, useEffect, useRef } from 'react';
import Board from '@/components/Board';
import Collection from '@/components/Collection';
import ProgressBar from '@/components/ProgressBar';
import ScorePanel from '@/components/ScorePanel';
import Background from '@/components/Background';
import PixelButton from '@/components/PixelButton';
import { useGameStore } from '@/store/useGameStore';
import { useAudioStore } from '@/store/useAudioStore';
import { useAudio } from '@/hooks/useAudio';
import type { Direction } from '@/utils/gameUtils';
import { RefreshCw, Pause, Play, Volume2, VolumeX, Cat, Sparkles } from 'lucide-react';
import { getLevelConfig } from '@/data/levelConfig';
import { getWallpaper } from '@/data/wallpapers';

export default function GamePage() {
  const initGame = useGameStore((s) => s.initGame);
  const handleMoveStore = useGameStore((s) => s.handleMove);
  const togglePause = useGameStore((s) => s.togglePause);
  const isPaused = useGameStore((s) => s.isPaused);
  const isLevelTransition = useGameStore((s) => s.isLevelTransition);
  const clearLevelTransition = useGameStore((s) => s.clearLevelTransition);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const newlyUnlocked = useGameStore((s) => s.newlyUnlocked);
  const isGameOver = useGameStore((s) => s.isGameOver);

  const sfxEnabled = useAudioStore((s) => s.sfxEnabled);
  const bgmEnabled = useAudioStore((s) => s.bgmEnabled);
  const toggleSfx = useAudioStore((s) => s.toggleSfx);
  const toggleBgm = useAudioStore((s) => s.toggleBgm);

  const {
    playMergeSound,
    playMoveSound,
    playUnlockSound,
    playLevelUpSound,
    playGameOverSound,
    ensureAudio,
  } = useAudio();

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (newlyUnlocked !== null && newlyUnlocked >= 1) {
      playUnlockSound();
    }
  }, [newlyUnlocked, playUnlockSound]);

  const prevGameOverRef = useRef(isGameOver);
  useEffect(() => {
    if (!prevGameOverRef.current && isGameOver) {
      playGameOverSound();
    }
    prevGameOverRef.current = isGameOver;
  }, [isGameOver, playGameOverSound]);

  const prevLevelRef = useRef(isLevelTransition);
  useEffect(() => {
    if (!prevLevelRef.current && isLevelTransition) {
      playLevelUpSound();
      const t = setTimeout(() => {
        clearLevelTransition();
      }, 1500);
      return () => clearTimeout(t);
    }
    prevLevelRef.current = isLevelTransition;
  }, [isLevelTransition, playLevelUpSound, clearLevelTransition]);

  const onMove = useCallback(
    (direction: Direction) => {
      ensureAudio();
      const { moved, merged } = handleMoveStore(direction);
      if (moved) {
        if (merged) {
          playMergeSound(3);
        } else {
          playMoveSound();
        }
      }
    },
    [handleMoveStore, playMergeSound, playMoveSound, ensureAudio]
  );

  const levelConfig = getLevelConfig(currentLevel);
  const wallpaper = getWallpaper(levelConfig.wallpaperIndex);
  const isDarkWallpaper = wallpaper.gradient.includes('1A237E');

  return (
    <Background>
      <div className="min-h-screen w-full px-4 py-5 md:px-8 lg:px-10 py-6">
        <header className="max-w-[1280px] mx-auto mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-md flex items-center justify-center text-2xl"
              style={{
                backgroundColor: '#FFD4A3',
                border: '3px solid #8B4513',
                boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
              }}
            >
              <Cat size={28} color="#8B4513" fill="#FF9AA2" />
            </div>
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-amber-900 tracking-widest">
                猫咪合成
              </h1>
              <div className="font-pixel text-[10px] text-amber-700 mt-0.5">
                <Sparkles size={10} className="inline mr-1" />
                Cat Merge · 2048 Style
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PixelButton
              size="sm"
              color="purple"
              onClick={toggleBgm}
              title={bgmEnabled ? '关闭背景音乐' : '开启背景音乐'}
            >
              {bgmEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="ml-1 hidden sm:inline">BGM</span>
            </PixelButton>
            <PixelButton
              size="sm"
              color="blue"
              onClick={toggleSfx}
              title={sfxEnabled ? '关闭音效' : '开启音效'}
            >
              {sfxEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="ml-1 hidden sm:inline">音效</span>
            </PixelButton>
            <PixelButton
              size="sm"
              color="orange"
              onClick={togglePause}
              disabled={isGameOver || isLevelTransition}
              title={isPaused ? '继续游戏' : '暂停游戏'}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span className="ml-1 hidden sm:inline">{isPaused ? '继续' : '暂停'}</span>
            </PixelButton>
            <PixelButton
              size="sm"
              color="green"
              onClick={() => {
                ensureAudio();
                initGame();
              }}
              title="重新开始"
            >
              <RefreshCw size={14} />
              <span className="ml-1 hidden sm:inline">重玩</span>
            </PixelButton>
          </div>
        </header>

        <div className="max-w-[1280px] mx-auto">
          <ScorePanel />
        </div>

        <main className="max-w-[1280px] mx-auto mt-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 lg:gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-center py-2">
              <div
                className="font-pixel text-sm text-amber-900 px-4 py-1.5 rounded-md inline-flex items-center gap-2"
                style={{
                  backgroundColor: isDarkWallpaper ? 'rgba(255,255,255,0.15)' : 'rgba(255,248,231,0.85)',
                  border: '3px solid rgba(93, 64, 55, 0.4)',
                  color: isDarkWallpaper ? '#FFFFFF' : '#78350F',
                }}
              >
                <span>🎨</span>
                <span>主题：{wallpaper.name}</span>
                <span>·</span>
                <span>📍 {levelConfig.title}</span>
              </div>
            </div>
            <Board onMove={onMove} />
            <ProgressBar />
          </div>

          <div className="w-full lg:sticky lg:top-4 lg:self-start">
            <Collection />
          </div>
        </main>

        <footer className="max-w-[1280px] mx-auto mt-6 text-center font-pixel text-[10px] text-amber-800/70">
          ⌨️ 键盘操作：方向键 / WASD 滑动 · 🖱️ 鼠标拖拽棋盘滑动 · 📱 触屏滑动
        </footer>
      </div>
    </Background>
  );
}
