import { useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Direction, move, addRandomTile, canMove } from '@/utils/gameUtils';
import { TOTAL_LEVELS, getLevelConfig } from '@/data/levelConfig';
import { UNLOCK_LEVEL } from '@/data/catLevels';

export interface MoveResult {
  moved: boolean;
  merged: boolean;
  maxLevelReached: number;
  levelPassed: boolean;
}

export interface GameSnapshot {
  board: ReturnType<typeof useGameStore.getState>['board'];
  score: number;
  currentLevelScore: number;
  currentLevel: number;
  isGameOver: boolean;
  generation: number;
}

export function useGameLogic() {
  const board = useGameStore((s) => s.board);
  const score = useGameStore((s) => s.score);
  const bestScore = useGameStore((s) => s.bestScore);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const currentLevelScore = useGameStore((s) => s.currentLevelScore);
  const unlockedCats = useGameStore((s) => s.unlockedCats);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isPaused = useGameStore((s) => s.isPaused);
  const isLevelTransition = useGameStore((s) => s.isLevelTransition);
  const newlyUnlocked = useGameStore((s) => s.newlyUnlocked);

  const initGame = useGameStore((s) => s.initGame);
  const togglePause = useGameStore((s) => s.togglePause);
  const clearLevelTransition = useGameStore((s) => s.clearLevelTransition);
  const clearNewlyUnlocked = useGameStore((s) => s.clearNewlyUnlocked);
  const patch = useGameStore((s) => s.patch);
  const bumpGeneration = useGameStore((s) => s.bumpGeneration);

  const getSnapshot = useCallback((): GameSnapshot => {
    const s = useGameStore.getState();
    return {
      board: s.board.map((row) => row.map((tile) => (tile ? { ...tile } : null))),
      score: s.score,
      currentLevelScore: s.currentLevelScore,
      currentLevel: s.currentLevel,
      isGameOver: s.isGameOver,
      generation: s.generation,
    };
  }, []);

  const applySnapshot = useCallback((snap: GameSnapshot): boolean => {
    const s = useGameStore.getState();

    if (snap.generation !== s.generation) {
      return false;
    }

    if (s.isLevelTransition) {
      return false;
    }

    useGameStore.setState({
      board: snap.board,
      score: snap.score,
      currentLevelScore: snap.currentLevelScore,
      currentLevel: snap.currentLevel,
      isGameOver: snap.isGameOver,
      isPaused: false,
    });

    return true;
  }, []);

  const handleMove = useCallback((direction: Direction): MoveResult => {
    const state = useGameStore.getState();
    if (state.isGameOver || state.isPaused || state.isLevelTransition) {
      return { moved: false, merged: false, maxLevelReached: 0, levelPassed: false };
    }

    const idRef = state._nextIdInternal;
    const result = move(state.board, direction, idRef);
    if (!result.moved) {
      return { moved: false, merged: false, maxLevelReached: 0, levelPassed: false };
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
    let newlyUnlockedLevel: number | null = state.newlyUnlocked;

    if (
      result.maxLevelReached >= UNLOCK_LEVEL &&
      !newUnlockedList.includes(UNLOCK_LEVEL)
    ) {
      newUnlockedList.push(UNLOCK_LEVEL);
      newlyUnlockedLevel = UNLOCK_LEVEL;
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
    const nextGeneration = isTransition ? state.generation + 1 : state.generation;

    patch({
      board: newBoard,
      score: newScore,
      bestScore: newBestScore,
      currentLevel: nextLevel,
      currentLevelScore: nextLevelScore,
      isGameOver: gameOver,
      isLevelTransition: isTransition,
      unlockedCats: newUnlockedList,
      newlyUnlocked: newlyUnlockedLevel,
      nextTileId: idRef.current,
      generation: nextGeneration,
    });

    return {
      moved: true,
      merged: hadMerge,
      maxLevelReached: result.maxLevelReached,
      levelPassed: isTransition,
    };
  }, [patch]);

  return {
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
    bumpGeneration,

    getSnapshot,
    applySnapshot,
  };
}
