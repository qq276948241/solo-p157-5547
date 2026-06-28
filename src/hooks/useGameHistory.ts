import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY = 3;

export interface SnapshotProvider<TSnapshot> {
  getSnapshot: () => TSnapshot;
  applySnapshot: (snap: TSnapshot) => boolean;
}

export function useGameHistory<TSnapshot>(provider: SnapshotProvider<TSnapshot>) {
  const { getSnapshot, applySnapshot } = provider;
  const historyRef = useRef<TSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);

  const pushSnapshot = useCallback(() => {
    historyRef.current.push(getSnapshot());
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    setCanUndo(historyRef.current.length > 0);
  }, [getSnapshot]);

  const undo = useCallback((): boolean => {
    if (historyRef.current.length === 0) return false;
    const snap = historyRef.current.pop()!;
    const applied = applySnapshot(snap);
    if (!applied) {
      historyRef.current = [];
      setCanUndo(false);
      return false;
    }
    setUndoCount((c) => c + 1);
    setCanUndo(historyRef.current.length > 0);
    return true;
  }, [applySnapshot]);

  const dropLast = useCallback(() => {
    if (historyRef.current.length === 0) return;
    historyRef.current.pop();
    setCanUndo(historyRef.current.length > 0);
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    setCanUndo(false);
  }, []);

  return {
    pushSnapshot,
    undo,
    dropLast,
    clear,
    canUndo,
    undoCount,
    get remaining() {
      return historyRef.current.length;
    },
  };
}
