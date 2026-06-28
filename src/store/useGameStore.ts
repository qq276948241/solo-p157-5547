import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Board,
  createEmptyBoard,
  addRandomTile,
  Direction,
  move,
  canMove,
  Tile,
} from '@/utils/gameUtils';
import { TOTAL_LEVELS, getLevelConfig } from '@/data/levelConfig';
import { UNLOCK_LEVEL } from '@/data/catLevels';

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
  handleMove: (direction: Direction) => { moved: boolean; merged: boolean };
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

      handleMove: (direction: Direction) => {
        const state = get();
        if (state.isGameOver || state.isPaused || state.isLevelTransition) {
          return { moved: false, merged: false };
        }

        const result = move(state.board, direction, idRef);
        if (!result.moved) {
          return { moved: false, merged: false };
        }

        const hadMerge = result.maxLevelReached > 0;

        let newBoard = result.newBoard;
        addRandomTile(newBoard, idRef);

        const newScore = state.score + result.scoreGained;
        const newBestScore = Math.max(state.bestScore, newScore);
        const newLevelScore = state.currentLevelScore + result.scoreGained;

        const levelConfig = getLevelConfig(state.currentLevel);
        let nextLevel = state.currentLevel;
        let nextLevelScore = newLevelScore;
        let isTransition = false;
        let newUnlockedList = [...state.unlockedCats];
        let newlyUnlocked: number | null = state.newlyUnlocked;

        if (
          result.maxLevelReached >= UNLOCK_LEVEL &&
          !newUnlockedList.includes(UNLOCK_LEVEL)
        ) {
          newUnlockedList.push(UNLOCK_LEVEL);
          newlyUnlocked = UNLOCK_LEVEL;
        }
        if (hadMerge && result.maxLevelReached > 0) {
          for (let lv = 1; lv <= result.maxLevelReached; lv++) {
            if (!newUnlockedList.includes(lv)) {
              newUnlockedList.push(lv);
            }
          }
        }

        if (newLevelScore >= levelConfig.targetScore) {
          nextLevel = Math.min(state.currentLevel + 1, TOTAL_LEVELS);
          nextLevelScore = newLevelScore - levelConfig.targetScore;
          if (state.currentLevel < TOTAL_LEVELS) {
            isTransition = true;
          }
        }

        const gameOver = !canMove(newBoard);

        set({
          board: newBoard,
          score: newScore,
          bestScore: newBestScore,
          currentLevel: nextLevel,
          currentLevelScore: nextLevelScore,
          isGameOver: gameOver,
          isLevelTransition: isTransition,
          unlockedCats: newUnlockedList,
          newlyUnlocked: newlyUnlocked,
          nextTileId: idRef.current,
        });

        return { moved: true, merged: hadMerge };
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
