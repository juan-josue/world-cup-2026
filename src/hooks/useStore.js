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
  const [adminUnlocks, setAdminUnlocks] = useState([]);
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
        setAdminUnlocks(d.adminUnlocks ?? []);
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
    updateDoc(DOC, { [`results.${matchId}`]: deleteField() });
  }, []);

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

  const seedR16Teams = useCallback(() => {
    patch({
      knockoutTeams: {
        ...knockoutTeams,
        R16_1: { home: 'Canada',         away: 'Morocco' },
        R16_2: { home: 'Paraguay',       away: 'France' },
        R16_3: { home: 'Brazil',         away: 'Norway' },
        R16_4: { home: 'Mexico',         away: 'England' },
        R16_5: { home: 'Portugal',       away: 'Spain' },
        R16_6: { home: 'United States',  away: 'Belgium' },
        R16_7: { home: 'Argentina',      away: 'Egypt' },
        R16_8: { home: 'Switzerland',    away: 'Colombia' },
      },
    });
  }, [knockoutTeams]);

  const seedQFTeams = useCallback(() => {
    patch({
      knockoutTeams: {
        ...knockoutTeams,
        QF1: { home: 'France',       away: 'Morocco'      }, // Jul 9  — France won 2-0
        QF2: { home: 'Spain',        away: 'Belgium'      }, // Jul 10 — Spain won 2-1
        QF3: { home: 'Norway',       away: 'England'      }, // Jul 11 — today 5pm ET
        QF4: { home: 'Argentina',    away: 'Switzerland'  }, // Jul 11 — today 9pm ET
      },
    });
  }, [knockoutTeams]);

  // Atomic fix for QF2/QF3 data swap.
  //
  // History: knockoutTeams.QF2 had Norway/England and QF3 had Spain/Belgium (wrong).
  // After seedQFTeams corrected the team display, data remained in wrong slots:
  //   - predictions.*.QF2  = Norway/England predictions (made when QF2 showed NOR/ENG)
  //   - predictions.*.QF3  = Spain/Belgium predictions  (made when QF3 showed ESP/BEL)
  //   - results.QF3        = {2,1} Spain/Belgium result (should be QF2)
  //
  // A prior partial fix (v1) used setDoc+merge which cannot delete Firestore fields:
  //   - Added predictions.*.QF2 = QF3 value for those who had QF3 → left QF3 as duplicate
  //   - Added results.QF2 = results.QF3                            → left QF3 still present
  //   - Did NOT touch predictions.*.QF2 (Norway/England preds)     → they stay in QF2
  //
  // Correct state after this fix:
  //   - predictions.*.QF2 = Spain/Belgium predictions
  //   - predictions.*.QF3 = Norway/England predictions (or absent if no prediction)
  //   - results.QF2       = {2,1}  (Spain 2-1 Belgium)
  //   - results.QF3       = absent (Norway/England hasn't played)
  const fixQF2QF3Swap = useCallback(async () => {
    const update = {};

    // 1. Delete results.QF3 (game not played; Spain/Belgium result already in QF2)
    if (results.QF3 !== undefined) {
      if (results.QF2 === undefined) {
        // v1 never added QF2 — copy it before deleting
        update['results.QF2'] = results.QF3;
      }
      update['results.QF3'] = deleteField();
    }

    // 2. Fix predictions per player
    for (const [playerId, preds] of Object.entries(predictions)) {
      if (!preds) continue;
      const hasQF2 = preds.QF2 !== undefined;
      const hasQF3 = preds.QF3 !== undefined;

      if (hasQF2 && hasQF3) {
        // v1 copied QF3 into QF2 but left QF3 as stale duplicate.
        // QF2 = Spain/Belgium pred (correct). Delete the QF3 dupe.
        update[`predictions.${playerId}.QF3`] = deleteField();
      } else if (hasQF2) {
        // Only QF2 = original Norway/England prediction. Move it to QF3.
        update[`predictions.${playerId}.QF3`] = preds.QF2;
        update[`predictions.${playerId}.QF2`] = deleteField();
      } else if (hasQF3) {
        // Only QF3 = Spain/Belgium pred that v1 failed to copy. Move to QF2.
        update[`predictions.${playerId}.QF2`] = preds.QF3;
        update[`predictions.${playerId}.QF3`] = deleteField();
      }
    }

    // 3. Fix SF bracket: Spain (QF2 winner) → SF1 away; clear from SF2 home
    if (knockoutTeams.SF1?.away !== 'Spain') {
      update['knockoutTeams.SF1.away'] = 'Spain';
    }
    if (knockoutTeams.SF2?.home === 'Spain') {
      update['knockoutTeams.SF2.home'] = deleteField();
    }

    if (Object.keys(update).length > 0) {
      await updateDoc(DOC, update);
    }
  }, [predictions, results, knockoutTeams]);

  return {
    players, predictions, results, knockoutTeams, activePlayer, loading,
    addPlayer, removePlayer, setPrediction, clearPrediction, setResult, clearResult, switchPlayer, setKnockoutTeam, setBonusPoints, resetAll, seedR32Teams, seedR16Teams, seedQFTeams, fixQF2QF3Swap,
  };
}
