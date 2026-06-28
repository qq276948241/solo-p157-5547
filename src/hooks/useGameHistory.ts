import { useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Board, cloneBoard } from '@/utils/gameUtils';

const MAX_HISTORY = 3;

interface Snapshot {
  board: Board;
  score: number;
  currentLevelScore: number;
  currentLevel: number;
  isGameOver: boolean;
}

export function useGameHistory() {
  const historyRef = useRef<Snapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);

  const pushSnapshot = useCallback(() => {
    const state = useGameStore.getState();
    const snapshot: Snapshot = {
      board: cloneBoard(state.board),
      score: state.score,
      currentLevelScore: state.currentLevelScore,
      currentLevel: state.currentLevel,
      isGameOver: state.isGameOver,
    };
    historyRef.current.push(snapshot);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    setCanUndo(historyRef.current.length > 0);
  }, []);

  const undo = useCallback((): boolean => {
    if (historyRef.current.length === 0) return false;
    const snap = historyRef.current.pop()!;

    useGameStore.setState({
      board: snap.board,
      score: snap.score,
      currentLevelScore: snap.currentLevelScore,
      currentLevel: snap.currentLevel,
      isGameOver: snap.isGameOver,
      isPaused: false,
      isLevelTransition: false,
      newlyUnlocked: null,
    });

    setUndoCount((c) => c + 1);
    setCanUndo(historyRef.current.length > 0);
    return true;
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    setCanUndo(false);
  }, []);

  return {
    pushSnapshot,
    undo,
    clear,
    canUndo,
    undoCount,
    remaining: historyRef.current.length,
  };
}
