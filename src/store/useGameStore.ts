import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board, createEmptyBoard, addRandomTile, Tile } from '@/utils/gameUtils';

interface GameState {
  board: Board;
  score: number;
  bestScore: number;
  currentLevel: number;
  currentLevelScore: number;
  unlockedCats: number[];
  isGameOver: boolean;
  isPaused: boolean;
  isLevelTransition: boolean;
  newlyUnlocked: number | null;
  nextTileId: number;
  _nextIdInternal: { current: number };

  initGame: () => void;
  patch: (partial: Partial<Omit<GameState, 'initGame' | 'patch' | 'togglePause' | 'resetGame' | 'clearLevelTransition' | 'clearNewlyUnlocked'>>) => void;
  togglePause: () => void;
  resetGame: () => void;
  clearLevelTransition: () => void;
  clearNewlyUnlocked: () => void;
}

const idRef = { current: 1 };

function initBoardWithTiles(nextId: { current: number }): Board {
  let board = createEmptyBoard();
  addRandomTile(board, nextId);
  addRandomTile(board, nextId);
  return board;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      board: createEmptyBoard(),
      score: 0,
      bestScore: 0,
      currentLevel: 1,
      currentLevelScore: 0,
      unlockedCats: [],
      isGameOver: false,
      isPaused: false,
      isLevelTransition: false,
      newlyUnlocked: null,
      nextTileId: 1,
      _nextIdInternal: idRef,

      initGame: () => {
        idRef.current = 1;
        const board = initBoardWithTiles(idRef);
        set({
          board,
          score: 0,
          currentLevelScore: 0,
          currentLevel: 1,
          isGameOver: false,
          isPaused: false,
          isLevelTransition: false,
          newlyUnlocked: null,
          nextTileId: idRef.current,
        });
      },

      patch: (partial) => {
        set(partial);
      },

      togglePause: () => {
        const s = get();
        if (s.isGameOver || s.isLevelTransition) return;
        set({ isPaused: !s.isPaused });
      },

      resetGame: () => {
        get().initGame();
      },

      clearLevelTransition: () => {
        set({ isLevelTransition: false });
      },

      clearNewlyUnlocked: () => {
        set({ newlyUnlocked: null });
      },
    }),
    {
      name: 'cat-merge-game',
      partialize: (state) => ({
        bestScore: state.bestScore,
        unlockedCats: state.unlockedCats,
      }),
    }
  )
);

export type { Tile };
