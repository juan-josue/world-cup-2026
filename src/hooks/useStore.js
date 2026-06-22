import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';

const DOC = doc(db, 'wc26', 'data');

// activePlayer is per-browser, stays in localStorage
function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function patch(data) {
  return setDoc(DOC, data, { merge: true });
}

export function useStore() {
  const [players, setPlayers] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [results, setResults] = useState({});
  const [knockoutTeams, setKnockoutTeams] = useState({});
  const [activePlayer, setActivePlayerState] = useState(() => loadLocal('wc26_activePlayer', null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(DOC, snap => {
      if (snap.exists()) {
        const d = snap.data();
        setPlayers(d.players ?? []);
        setPredictions(d.predictions ?? {});
        setResults(d.results ?? {});
        setKnockoutTeams(d.knockoutTeams ?? {});
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const addPlayer = useCallback((name, color) => {
    const id = `p_${Date.now()}`;
    patch({ players: [...players, { id, name, color }] });
    return id;
  }, [players]);

  const removePlayer = useCallback((id) => {
    const newPredictions = { ...predictions };
    delete newPredictions[id];
    patch({ players: players.filter(p => p.id !== id), predictions: newPredictions });
    if (activePlayer === id) {
      setActivePlayerState(null);
      localStorage.removeItem('wc26_activePlayer');
    }
  }, [players, predictions, activePlayer]);

  const setPrediction = useCallback((playerId, matchId, homeScore, awayScore) => {
    patch({
      predictions: {
        ...predictions,
        [playerId]: { ...(predictions[playerId] || {}), [matchId]: { homeScore, awayScore } },
      },
    });
  }, [predictions]);

  const clearPrediction = useCallback((playerId, matchId) => {
    updateDoc(DOC, { [`predictions.${playerId}.${matchId}`]: deleteField() });
  }, []);

  const setResult = useCallback((matchId, homeScore, awayScore) => {
    patch({ results: { ...results, [matchId]: { homeScore, awayScore } } });
  }, [results]);

  const clearResult = useCallback((matchId) => {
    const r = { ...results };
    delete r[matchId];
    patch({ results: r });
  }, [results]);

  const switchPlayer = useCallback((id) => {
    setActivePlayerState(id);
    localStorage.setItem('wc26_activePlayer', JSON.stringify(id));
  }, []);

  const setKnockoutTeam = useCallback((matchId, home, away) => {
    patch({ knockoutTeams: { ...knockoutTeams, [matchId]: { home, away } } });
  }, [knockoutTeams]);

  const resetAll = useCallback(() => {
    setDoc(DOC, { players: [], predictions: {}, results: {}, knockoutTeams: {} });
    setActivePlayerState(null);
    localStorage.removeItem('wc26_activePlayer');
  }, []);

  return {
    players, predictions, results, knockoutTeams, activePlayer, loading,
    addPlayer, removePlayer, setPrediction, clearPrediction, setResult, clearResult, switchPlayer, setKnockoutTeam, resetAll,
  };
}
