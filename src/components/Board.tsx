import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Direction, BOARD_SIZE, Board as BoardType } from '@/utils/gameUtils';
import Tile from './Tile';

const CELL_SIZE = 96;
const GAP = 8;

interface BoardProps {
  onMove: (direction: Direction) => void;
}

export default function Board({ onMove }: BoardProps) {
  const board = useGameStore((s) => s.board);
  const isPaused = useGameStore((s) => s.isPaused);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isLevelTransition = useGameStore((s) => s.isLevelTransition);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const boardSize = CELL_SIZE * BOARD_SIZE + GAP * (BOARD_SIZE + 1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isPaused || isGameOver || isLevelTransition) return;
      const map: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        W: 'up',
        s: 'down',
        S: 'down',
        a: 'left',
        A: 'left',
        d: 'right',
        D: 'right',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        onMove(dir);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onMove, isPaused, isGameOver, isLevelTransition]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPaused || isGameOver || isLevelTransition) return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 20;
    if (Math.max(absX, absY) < threshold) return;
    let dir: Direction;
    if (absX > absY) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    onMove(dir);
    touchStart.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPaused || isGameOver || isLevelTransition) return;
    touchStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!touchStart.current) return;
    const dx = e.clientX - touchStart.current.x;
    const dy = e.clientY - touchStart.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 20;
    if (Math.max(absX, absY) < threshold) {
      touchStart.current = null;
      return;
    }
    let dir: Direction;
    if (absX > absY) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    onMove(dir);
    touchStart.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto rounded-lg p-0 select-none"
      style={{
        width: boardSize,
        height: boardSize,
        backgroundColor: 'rgba(93, 64, 55, 0.35)',
        border: '4px solid rgba(93, 64, 55, 0.6)',
        borderRadius: 12,
        boxShadow: '0 8px 0 rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => (touchStart.current = null)}
    >
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 p-2" style={{ gap: GAP }}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => (
          <div
            key={i}
            className="rounded-md"
            style={{
              backgroundColor: 'rgba(255, 248, 231, 0.5)',
              border: '2px solid rgba(93, 64, 55, 0.25)',
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 p-2">
        <div className="relative" style={{ width: CELL_SIZE * BOARD_SIZE, height: CELL_SIZE * BOARD_SIZE }}>
          <TilesLayer board={board} />
        </div>
      </div>

      {isPaused && (
        <Overlay>
          <div className="font-pixel text-3xl text-amber-900 animate-pulse">⏸ 暂停</div>
          <div className="font-pixel text-sm text-amber-800 mt-2">点击继续按钮恢复</div>
        </Overlay>
      )}
      {isGameOver && !isPaused && (
        <Overlay>
          <div className="font-pixel text-3xl text-rose-700">💔 游戏结束</div>
          <div className="font-pixel text-sm text-amber-900 mt-2">棋盘满了喵~</div>
        </Overlay>
      )}
      {isLevelTransition && (
        <Overlay>
          <div className="font-pixel text-3xl text-emerald-700 animate-bounce">🎉 过关啦!</div>
          <div className="font-pixel text-sm text-amber-900 mt-2">准备进入下一关...</div>
        </Overlay>
      )}
    </div>
  );
}

function TilesLayer({ board }: { board: BoardType }) {
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c =0; c < BOARD_SIZE; c++) {
      const tile = board[r][c];
      if (tile) {
        tiles.push(<Tile key={tile.id} tile={tile} cellSize={CELL_SIZE} gap={GAP} />);
      }
    }
  }
  return <>{tiles}</>;
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg"
      style={{ backgroundColor: 'rgba(255, 248, 231, 0.92)', backdropFilter: 'blur(2px)' }}
    >
      {children}
    </div>
  );
}
