import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Board from '@/components/Board';
import Collection from '@/components/Collection';
import ProgressBar from '@/components/ProgressBar';
import ScorePanel from '@/components/ScorePanel';
import Background from '@/components/Background';
import PixelButton from '@/components/PixelButton';
import { useAudioStore } from '@/store/useAudioStore';
import { useGameLogic, type GameSnapshot } from '@/hooks/useGameLogic';
import { useGameHistory } from '@/hooks/useGameHistory';
import { useAudio } from '@/hooks/useAudio';
import type { Direction } from '@/utils/gameUtils';
import { RefreshCw, Pause, Play, Volume2, VolumeX, Cat, Sparkles, Undo2 } from 'lucide-react';
import { getLevelConfig } from '@/data/levelConfig';
import { getWallpaper } from '@/data/wallpapers';

const UNDO_ANIM_MS = 280;
const NEWLY_UNLOCKED_MS = 3000;
const LEVEL_TRANSITION_MS = 1500;

export default function GamePage() {
  const {
    board,
    score,
    bestScore,
    currentLevel,
    currentLevelScore,
    unlockedCats,
    isGameOver,
    isPaused,
    isLevelTransition,
    newlyUnlocked,

    initGame,
    handleMove,
    togglePause,
    clearLevelTransition,
    clearNewlyUnlocked,

    getSnapshot,
    applySnapshot,
  } = useGameLogic();

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
    playUndoSound,
    ensureAudio,
  } = useAudio();

  const snapshotProvider = useMemo(
    (): { getSnapshot: () => GameSnapshot; applySnapshot: (s: GameSnapshot) => boolean } => ({
      getSnapshot,
      applySnapshot,
    }),
    [getSnapshot, applySnapshot]
  );

  const { pushSnapshot, undo, dropLast, clear, canUndo, undoCount, remaining } =
    useGameHistory(snapshotProvider);

  const [isUndoing, setIsUndoing] = useState(false);
  const undoingTimer = useRef<number | null>(null);

  const wasGameOverRef = useRef(isGameOver);
  const wasTransitionRef = useRef(isLevelTransition);
  const prevNewlyUnlockedRef = useRef(newlyUnlocked);

  useEffect(() => {
    initGame();
    clear();
  }, [initGame, clear]);

  useEffect(() => {
    if (newlyUnlocked !== null && newlyUnlocked !== prevNewlyUnlockedRef.current) {
      playUnlockSound();
      const t = window.setTimeout(() => clearNewlyUnlocked(), NEWLY_UNLOCKED_MS);
      prevNewlyUnlockedRef.current = newlyUnlocked;
      return () => window.clearTimeout(t);
    }
    prevNewlyUnlockedRef.current = newlyUnlocked;
  }, [newlyUnlocked, playUnlockSound, clearNewlyUnlocked]);

  useEffect(() => {
    if (!wasGameOverRef.current && isGameOver) {
      playGameOverSound();
    }
    wasGameOverRef.current = isGameOver;
  }, [isGameOver, playGameOverSound]);

  useEffect(() => {
    if (!wasTransitionRef.current && isLevelTransition) {
      playLevelUpSound();
      clear();
      const t = window.setTimeout(() => clearLevelTransition(), LEVEL_TRANSITION_MS);
      wasTransitionRef.current = isLevelTransition;
      return () => window.clearTimeout(t);
    }
    wasTransitionRef.current = isLevelTransition;
  }, [isLevelTransition, playLevelUpSound, clearLevelTransition, clear]);

  const onMove = useCallback(
    (direction: Direction) => {
      ensureAudio();
      pushSnapshot();
      const { moved, merged, levelPassed } = handleMove(direction);
      if (!moved) {
        dropLast();
        return;
      }
      if (levelPassed) {
        clear();
      }
      if (merged) {
        playMergeSound(3);
      } else {
        playMoveSound();
      }
    },
    [handleMove, pushSnapshot, dropLast, clear, playMergeSound, playMoveSound, ensureAudio]
  );

  const handleUndo = useCallback(() => {
    ensureAudio();
    const ok = undo();
    if (!ok) return;
    playUndoSound();
    setIsUndoing(true);
    if (undoingTimer.current !== null) window.clearTimeout(undoingTimer.current);
    undoingTimer.current = window.setTimeout(() => setIsUndoing(false), UNDO_ANIM_MS);
  }, [undo, playUndoSound, ensureAudio]);

  useEffect(() => {
    return () => {
      if (undoingTimer.current !== null) window.clearTimeout(undoingTimer.current);
    };
  }, []);

  const handleNewGame = useCallback(() => {
    ensureAudio();
    clear();
    initGame();
  }, [ensureAudio, clear, initGame]);

  const levelConfig = getLevelConfig(currentLevel);
  const wallpaper = getWallpaper(levelConfig.wallpaperIndex);
  const isDarkWallpaper = wallpaper.gradient.includes('1A237E');

  return (
    <Background currentLevel={currentLevel}>
      <style>{`
        @keyframes cat-rewind {
          0% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg) brightness(1); }
          25% { transform: scale(0.88) rotate(-3deg); filter: hue-rotate(-20deg) brightness(1.15); }
          50% { transform: scale(0.82) rotate(0deg); filter: hue-rotate(0deg) brightness(0.9); }
          75% { transform: scale(0.94) rotate(2deg); filter: hue-rotate(10deg) brightness(1.08); }
          100% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg) brightness(1); }
        }
        .cat-undoing > [class*="relative"] > [class*="absolute"] [style*="left"] {
          animation: cat-rewind 0.28s cubic-bezier(.4,0,.2,1);
        }
      `}</style>

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

          <div className="flex items-center gap-2 flex-wrap">
            <PixelButton
              size="sm"
              color="gray"
              onClick={handleUndo}
              disabled={!canUndo || isPaused || isLevelTransition || isUndoing}
              title={`撤回上一步（剩余 ${remaining}/3）`}
            >
              <Undo2 size={14} />
              <span className="ml-1 hidden sm:inline">撤回</span>
              <span className="ml-1 font-pixel text-[9px] opacity-80">({remaining})</span>
            </PixelButton>
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
              onClick={handleNewGame}
              title="重新开始"
            >
              <RefreshCw size={14} />
              <span className="ml-1 hidden sm:inline">重玩</span>
            </PixelButton>
          </div>
        </header>

        <div className="max-w-[1280px] mx-auto">
          <ScorePanel score={score} bestScore={bestScore} currentLevel={currentLevel} />
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
            <div
              key={undoCount}
              className={isUndoing ? 'cat-undoing' : ''}
            >
              <Board
                board={board}
                isPaused={isPaused}
                isGameOver={isGameOver}
                isLevelTransition={isLevelTransition}
                onMove={onMove}
              />
            </div>
            <ProgressBar currentLevel={currentLevel} currentLevelScore={currentLevelScore} />
          </div>

          <div className="w-full lg:sticky lg:top-4 lg:self-start">
            <Collection unlockedCats={unlockedCats} newlyUnlocked={newlyUnlocked} />
          </div>
        </main>

        <footer className="max-w-[1280px] mx-auto mt-6 text-center font-pixel text-[10px] text-amber-800/70">
          ⌨️ 键盘操作：方向键 / WASD 滑动 · 🖱️ 鼠标拖拽棋盘滑动 · 📱 触屏滑动 · ↩️ 可撤回3步
        </footer>
      </div>
    </Background>
  );
}
