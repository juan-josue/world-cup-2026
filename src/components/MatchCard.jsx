import { useState, useEffect, useRef } from 'react';
import { FLAGS, scoreForMatch, isLocked, formatKickoff, liveClock } from '../data/worldcup';
import styles from './MatchCard.module.css';

const STATUS_LABEL = { done: 'Final', live: '● Live', upcoming: 'Upcoming' };
const STATUS_CLASS = { done: styles.statusDone, live: styles.statusLive, upcoming: styles.statusUpcoming };

function ScoreInput({ value, onChange, disabled }) {
  return (
    <input
      type="number" min="0" max="20"
      className={styles.scoreInput}
      value={value === undefined || value === '' ? '' : value}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      disabled={disabled}
      placeholder="–"
    />
  );
}

export default function MatchCard({
  match, groupLabel,
  prediction, result, now,
  focusMatchId, focusKey,
  onSetPrediction, onClearPrediction, onSetResult,
  isAdmin, activePlayer,
}) {
  const { id, home, away } = match;
  const hasResult = result !== undefined;
  const hasPred = prediction !== undefined;
  const locked = isLocked(id, now);
  const cardRef = useRef(null);

  const ko = match.kickoff ? Date.parse(match.kickoff) : null;
  const status = hasResult ? 'done' : (ko && now >= ko) ? 'live' : 'upcoming';
  const kf = formatKickoff(match.kickoff);

  const predHome = prediction?.homeScore;
  const predAway = prediction?.awayScore;
  const resHome = result?.homeScore;
  const resAway = result?.awayScore;
  const pts = hasResult && hasPred ? scoreForMatch(prediction, result) : null;
  const isExact = pts !== null && Number(predHome) === Number(resHome) && Number(predAway) === Number(resAway);

  // Admin result-entry local state
  const [localResHome, setLocalResHome] = useState(resHome ?? '');
  const [localResAway, setLocalResAway] = useState(resAway ?? '');
  useEffect(() => { setLocalResHome(resHome ?? ''); setLocalResAway(resAway ?? ''); }, [resHome, resAway]);

  // Inline prediction stepper state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([0, 0]);

  const startEdit = () => {
    setDraft([Number(predHome) || 0, Number(predAway) || 0]);
    setEditing(true);
  };
  const bump = (side, d) => setDraft(prev => {
    const next = [...prev];
    next[side] = Math.max(0, Math.min(20, next[side] + d));
    return next;
  });
  const savePred = () => { onSetPrediction(draft[0], draft[1]); setEditing(false); };
  const clearAndClose = () => { onClearPrediction(); setEditing(false); };

  // Scroll to + flash when this card is the jump target.
  useEffect(() => {
    if (focusMatchId !== id || !focusKey) return;
    const el = cardRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove(styles.highlight);
    void el.offsetWidth;
    el.classList.add(styles.highlight);
    const t = setTimeout(() => el.classList.remove(styles.highlight), 1800);
    return () => clearTimeout(t);
  }, [focusKey, focusMatchId, id]);

  const handleResChange = (side, val) => {
    const h = side === 'home' ? val : localResHome;
    const a = side === 'away' ? val : localResAway;
    if (side === 'home') setLocalResHome(val); else setLocalResAway(val);
    if (h !== '' && h !== undefined && a !== '' && a !== undefined) onSetResult(h, a);
  };

  // Outcome highlighting
  let homeClass = '', awayClass = '';
  if (hasResult) {
    if (resHome > resAway) { homeClass = styles.winner; awayClass = styles.loser; }
    else if (resAway > resHome) { homeClass = styles.loser; awayClass = styles.winner; }
    else { homeClass = styles.draw; awayClass = styles.draw; }
  }

  const clock = status === 'live' && ko ? liveClock(ko, now) : null;

  return (
    <div ref={cardRef} className={`${styles.card} ${hasResult ? styles.settled : ''} ${status === 'live' ? styles.live : ''}`}>
      <div className={styles.meta}>
        <span className={styles.group}>{groupLabel}</span>
        <span className={`${styles.status} ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
        <span className={styles.date}>{kf.date} · {kf.time}</span>
        {pts !== null && (
          <span className={`${styles.pts} ${isExact ? styles.ptsExact : pts > 1 ? styles.ptsGood : pts === 0 ? styles.ptsBad : ''}`}>
            {isExact ? '⚡' : ''}{pts}pt{pts !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className={styles.matchup}>
        <div className={`${styles.team} ${styles.teamHome} ${homeClass}`}>
          <span className={styles.flag}>{FLAGS[home] || '🏳️'}</span>
          <span className={styles.teamName}>{home}</span>
        </div>

        <div className={styles.scores}>
          {/* Center: admin inputs / result / live minute / VS */}
          {isAdmin ? (
            <div className={styles.scoreRow}>
              <ScoreInput value={localResHome} onChange={v => handleResChange('home', v)} />
              <span className={styles.vs}>RES</span>
              <ScoreInput value={localResAway} onChange={v => handleResChange('away', v)} />
            </div>
          ) : hasResult ? (
            <div className={styles.resultDisplay}>
              <span className={styles.resultNum}>{resHome}</span>
              <span className={styles.resultSep}>–</span>
              <span className={styles.resultNum}>{resAway}</span>
            </div>
          ) : status === 'live' ? (
            <div className={styles.liveMin}>{clock?.label}</div>
          ) : (
            <div className={styles.vsLabel}>VS</div>
          )}

          {/* Prediction control (players only) */}
          {!isAdmin && activePlayer && (
            editing ? (
              <div className={styles.stepper}>
                <div className={styles.seg}>
                  <button className={styles.ar} onClick={() => bump(0, 1)} aria-label="home up">▲</button>
                  <button className={styles.ar} onClick={() => bump(0, -1)} aria-label="home down">▼</button>
                </div>
                <span className={styles.sv}>{draft[0]}</span>
                <span className={styles.stepSep}>–</span>
                <span className={styles.sv}>{draft[1]}</span>
                <div className={styles.seg}>
                  <button className={styles.ar} onClick={() => bump(1, 1)} aria-label="away up">▲</button>
                  <button className={styles.ar} onClick={() => bump(1, -1)} aria-label="away down">▼</button>
                </div>
                <button className={styles.saveP} onClick={savePred}>Save</button>
                {hasPred && <button className={styles.clearP} onClick={clearAndClose} title="Clear prediction">×</button>}
              </div>
            ) : hasResult ? (
              hasPred
                ? <span className={`${styles.predBadge} ${styles.predBadgeLocked}`}>{predHome}–{predAway}</span>
                : <span className={styles.lockedChip}>No bet</span>
            ) : locked ? (
              hasPred
                ? <span className={styles.predBadgeWrap}><span className={`${styles.predBadge} ${styles.predBadgeLocked}`}>{predHome}–{predAway}</span><span className={styles.lockedChip}>🔒</span></span>
                : <span className={styles.lockedChip}>🔒 Locked</span>
            ) : hasPred ? (
              <button className={styles.predBadge} onClick={startEdit} title="Edit prediction">{predHome}–{predAway}</button>
            ) : (
              <button className={styles.predictBtn} onClick={startEdit}>+ Predict</button>
            )
          )}
        </div>

        <div className={`${styles.team} ${styles.teamAway} ${awayClass}`}>
          <span className={styles.flag}>{FLAGS[away] || '🏳️'}</span>
          <span className={styles.teamName}>{away}</span>
        </div>
      </div>
    </div>
  );
}
