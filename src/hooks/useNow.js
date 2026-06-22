import { useState, useEffect } from 'react';

/**
 * Shared coarse clock. Returns the current epoch ms and re-renders the consumer
 * on a fixed interval so time-based UI (e.g. prediction locks at kickoff) flips
 * without a manual refresh. Call once high in the tree and drill `now` down.
 */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
