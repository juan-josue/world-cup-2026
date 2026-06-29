import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import { propagateKnockoutResult } from '../data/worldcup';

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

  const setBonusPoints = useCallback((playerId, points) => {
    patch({ players: players.map(p => p.id === playerId ? { ...p, bonusPoints: points } : p) });
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

  const setPrediction = useCallback((playerId, matchId, predObj) => {
    patch({
      predictions: {
        ...predictions,
        [playerId]: { ...(predictions[playerId] || {}), [matchId]: predObj },
      },
    });
  }, [predictions]);

  const clearPrediction = useCallback((playerId, matchId) => {
    updateDoc(DOC, { [`predictions.${playerId}.${matchId}`]: deleteField() });
  }, []);

  const setResult = useCallback((matchId, homeScore, awayScore, advancingTeam) => {
    const resultObj = { homeScore, awayScore };
    if (advancingTeam) resultObj.advancingTeam = advancingTeam;
    const update = { results: { ...results, [matchId]: resultObj } };

    const teamPatch = propagateKnockoutResult(matchId, resultObj, knockoutTeams);
    if (teamPatch) update.knockoutTeams = { ...knockoutTeams, ...teamPatch };

    patch(update);
  }, [results, knockoutTeams]);

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

  const seedR32Teams = useCallback(() => {
    patch({
      knockoutTeams: {
        ...knockoutTeams,
        R32_1:  { home: 'South Africa',          away: 'Canada' },
        R32_2:  { home: 'Brazil',                away: 'Japan' },
        R32_3:  { home: 'Germany',               away: 'Paraguay' },
        R32_4:  { home: 'Netherlands',           away: 'Morocco' },
        R32_5:  { home: 'Ivory Coast',           away: 'Norway' },
        R32_6:  { home: 'France',                away: 'Sweden' },
        R32_7:  { home: 'Mexico',                away: 'Ecuador' },
        R32_8:  { home: 'England',               away: 'DR Congo' },
        R32_9:  { home: 'Belgium',               away: 'Senegal' },
        R32_10: { home: 'United States',         away: 'Bosnia and Herzegovina' },
        R32_11: { home: 'Spain',                 away: 'Austria' },
        R32_12: { home: 'Portugal',              away: 'Croatia' },
        R32_13: { home: 'Switzerland',           away: 'Algeria' },
        R32_14: { home: 'Australia',             away: 'Egypt' },
        R32_15: { home: 'Argentina',             away: 'Cape Verde' },
        R32_16: { home: 'Colombia',              away: 'Ghana' },
      },
    });
  }, [knockoutTeams]);

  return {
    players, predictions, results, knockoutTeams, activePlayer, loading,
    addPlayer, removePlayer, setPrediction, clearPrediction, setResult, clearResult, switchPlayer, setKnockoutTeam, setBonusPoints, resetAll, seedR32Teams,
  };
}
