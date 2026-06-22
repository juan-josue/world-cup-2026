import { useState, useEffect, useRef } from 'react';
import { FLAGS, scoreForMatch, isLocked, formatKickoff } from '../data/worldcup';
import PredictionModal from './PredictionModal';
import styles from './KnockoutMatchCard.module.css';

function ScoreInput({ value, onChange }) {
  return (
    <input
      type="number" min="0" max="20"
      className={styles.scoreInput}
      value={value === undefined || value === '' ? '' : value}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      placeholder="–"
    />
  );
}

export default function KnockoutMatchCard({
  match, teams, result, prediction, now,
  focusMatchId, focusKey,
  onSetTeams, onSetResult, onSetPrediction,
  isAdmin, activePlayer,
  pairPosition, // 'top' | 'bottom' | 'single'
  isLast,       // true for Final/3rd (no right connector)
}) {
  const home = teams?.home ?? null;
  const away = teams?.away ?? null;
  const hasTeams = !!home && !!away;
  const hasResult = result !== undefined;
  const hasPred = prediction !== undefined;
  const locked = isLocked(match.id, now);
  const editable = !hasResult && !locked;
  const cardRef = useRef(null);

  const pts = hasResult && hasPred ? scoreForMatch(prediction, result) : null;
  const resHome = result?.homeScore;
  const resAway = result?.awayScore;
  const predHome = prediction?.homeScore;
  const predAway = prediction?.awayScore;

  const [localResHome, setLocalResHome] = useState(resHome ?? '');
  const [localResAway, setLocalResAway] = useState(resAway ?? '');
  const [adminHome, setAdminHome] = useState(home ?? '');
  const [adminAway, setAdminAway] = useState(away ?? '');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { setLocalResHome(resHome ?? ''); setLocalResAway(resAway ?? ''); }, [resHome, resAway]);
  useEffect(() => { setAdminHome(home ?? ''); setAdminAway(away ?? ''); }, [home, away]);

  // Scroll to and flash this card when it's the jump target (banner "Lock in bet").
  useEffect(() => {
    if (focusMatchId !== match.id || !focusKey) return;
    const el = cardRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove(styles.highlight);
    void el.offsetWidth; // force reflow so the animation restarts on repeat clicks
    el.classList.add(styles.highlight);
    const t = setTimeout(() => el.classList.remove(styles.highlight), 1800);
    return () => clearTimeout(t);
  }, [focusKey, focusMatchId, match.id]);

  const handleResChange = (side, val) => {
    const h = side === 'home' ? val : localResHome;
    const a = side === 'away' ? val : localResAway;
    if (side === 'home') setLocalResHome(val); else setLocalResAway(val);
    if (h !== '' && h !== undefined && a !== '' && a !== undefined) onSetResult(h, a);
  };

  const handleTeamsSave = () => {
    if (adminHome.trim() && adminAway.trim()) onSetTeams(adminHome.trim(), adminAway.trim());
  };

  // Outcome highlighting
  let homeWin = false, awayWin = false, isDraw = false;
  if (hasResult) {
    if (resHome > resAway) homeWin = true;
    else if (resAway > resHome) awayWin = true;
    else isDraw = true;
  }

  const isExact = pts !== null && prediction &&
    Number(predHome) === Number(resHome) && Number(predAway) === Number(resAway);

  const wrapperClass = [
    styles.wrapper,
    pairPosition === 'top' && !isLast ? styles.pairTop : '',
    pairPosition === 'bottom' && !isLast ? styles.pairBottom : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={wrapperClass}>
        <div ref={cardRef} className={`${styles.card} ${hasResult ? styles.settled : ''}`}>
          <div className={styles.meta}>
            <span className={styles.date}>{formatKickoff(match.kickoff).date} · {formatKickoff(match.kickoff).time}</span>
            {pts !== null && (
              <span className={`${styles.pts} ${isExact ? styles.ptsExact : pts > 1 ? styles.ptsGood : pts === 0 ? styles.ptsBad : ''}`}>
                {isExact ? '⚡' : ''}{pts}pt{pts !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Admin team inputs when teams are TBD */}
          {isAdmin && !hasTeams ? (
            <div className={styles.teamInputs}>
              <input className={styles.teamInput} value={adminHome} onChange={e => setAdminHome(e.target.value)} placeholder={match.homeDesc} />
              <span className={styles.vsSmall}>vs</span>
              <input className={styles.teamInput} value={adminAway} onChange={e => setAdminAway(e.target.value)} placeholder={match.awayDesc} />
              <button className={styles.setBtn} onClick={handleTeamsSave} disabled={!adminHome.trim() || !adminAway.trim()}>Set</button>
            </div>
          ) : (
            <div className={styles.matchup}>
              <div className={`${styles.team} ${homeWin ? styles.winner : awayWin ? styles.loser : isDraw ? styles.draw : ''}`}>
                <span className={styles.flag}>{home ? (FLAGS[home] || '🏳️') : '❓'}</span>
                <span className={styles.teamName}>{home ?? match.homeDesc}</span>
              </div>

              <div className={styles.scores}>
                {isAdmin && hasTeams ? (
                  <div className={styles.scoreRow}>
                    <ScoreInput value={localResHome} onChange={v => handleResChange('home', v)} />
                    <span className={styles.sep}>–</span>
                    <ScoreInput value={localResAway} onChange={v => handleResChange('away', v)} />
                  </div>
                ) : hasResult ? (
                  <div className={styles.result}>
                    <span className={`${styles.resNum} ${homeWin ? styles.winNum : ''}`}>{resHome}</span>
                    <span className={styles.resSep}>–</span>
                    <span className={`${styles.resNum} ${awayWin ? styles.winNum : ''}`}>{resAway}</span>
                  </div>
                ) : (
                  <span className={styles.vs}>{hasTeams ? 'VS' : '—'}</span>
                )}

                {activePlayer && hasTeams && (
                  hasPred ? (
                    <button
                      className={`${styles.predBadge} ${!editable ? styles.predLocked : ''}`}
                      onClick={() => editable && setModalOpen(true)}
                      title={hasResult ? 'Settled' : locked ? 'Betting closed' : 'Edit prediction'}
                    >{predHome} – {predAway}</button>
                  ) : editable ? (
                    <button className={styles.predictBtn} onClick={() => setModalOpen(true)}>+ Predict</button>
                  ) : locked ? (
                    <span className={styles.lockedChip} title="Locked at kickoff">🔒</span>
                  ) : null
                )}
              </div>

              <div className={`${styles.team} ${styles.teamRight} ${awayWin ? styles.winner : homeWin ? styles.loser : isDraw ? styles.draw : ''}`}>
                <span className={styles.flag}>{away ? (FLAGS[away] || '🏳️') : '❓'}</span>
                <span className={styles.teamName}>{away ?? match.awayDesc}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <PredictionModal
          match={{ ...match, group: match.round?.toUpperCase() }}
          prediction={prediction}
          onSave={(h, a) => onSetPrediction(h, a)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
