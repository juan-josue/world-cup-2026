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
  roundId,
  onSetTeams, onSetResult, onSetPrediction,
  isAdmin, activePlayer,
  mobile,
}) {
  const home = teams?.home ?? null;
  const away = teams?.away ?? null;
  const hasTeams = !!home && !!away;
  const hasResult = result !== undefined;
  const hasPred = prediction !== undefined;
  const locked = isLocked(match.id, now);
  const editable = !hasResult && !locked;
  const cardRef = useRef(null);

  const pts = hasResult && hasPred ? scoreForMatch(prediction, result, { isKnockout: true }) : null;
  const resHome = result?.homeScore;
  const resAway = result?.awayScore;
  const predHome = prediction?.homeScore;
  const predAway = prediction?.awayScore;

  const [localResHome, setLocalResHome] = useState(resHome ?? '');
  const [localResAway, setLocalResAway] = useState(resAway ?? '');
  const [localAdvancing, setLocalAdvancing] = useState(result?.advancingTeam ?? null);
  const [adminHome, setAdminHome] = useState(home ?? '');
  const [adminAway, setAdminAway] = useState(away ?? '');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { setLocalResHome(resHome ?? ''); setLocalResAway(resAway ?? ''); }, [resHome, resAway]);
  useEffect(() => { setLocalAdvancing(result?.advancingTeam ?? null); }, [result?.advancingTeam]);
  useEffect(() => { setAdminHome(home ?? ''); setAdminAway(away ?? ''); }, [home, away]);

  useEffect(() => {
    if (focusMatchId !== match.id || !focusKey) return;
    const el = cardRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove(styles.highlight);
    void el.offsetWidth;
    el.classList.add(styles.highlight);
    const t = setTimeout(() => el.classList.remove(styles.highlight), 1800);
    return () => clearTimeout(t);
  }, [focusKey, focusMatchId, match.id]);

  const isDraw90 = localResHome !== '' && localResAway !== '' &&
    Number(localResHome) === Number(localResAway);

  const handleResChange = (side, val) => {
    const h = side === 'home' ? val : localResHome;
    const a = side === 'away' ? val : localResAway;
    if (side === 'home') setLocalResHome(val); else setLocalResAway(val);
    if (h === '' || h === undefined || a === '' || a === undefined) return;
    if (Number(h) !== Number(a)) {
      // Non-draw: advancing team is obvious, save immediately
      onSetResult(h, a, undefined);
    } else if (localAdvancing) {
      // Draw but advancing team already picked
      onSetResult(h, a, localAdvancing);
    }
    // Draw without advancing team: wait for pick below
  };

  const handleAdvancingPick = (team) => {
    setLocalAdvancing(team);
    if (localResHome !== '' && localResAway !== '') {
      onSetResult(localResHome, localResAway, team);
    }
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

  const isFinalMatch = match.id === 'FINAL';

  const cardClass = [
    styles.card,
    mobile ? styles.mobile : '',
    hasResult ? styles.settled : hasPred ? styles.hasPred : '',
    roundId ? styles[`round_${roundId}`] : '',
    isFinalMatch ? styles.isFinal : '',
  ].filter(Boolean).join(' ');

  // Derived advancing team from result (auto for non-draws)
  const resultAdvancing = hasResult
    ? (resHome !== resAway ? (resHome > resAway ? 'home' : 'away') : result?.advancingTeam)
    : null;

  return (
    <>
      <div ref={cardRef} className={cardClass}>
          <div className={styles.meta}>
            {isFinalMatch && <span className={styles.matchBadge}>⚽ Final</span>}
            <span className={styles.date}>{formatKickoff(match.kickoff).date} · {formatKickoff(match.kickoff).time}</span>
            {pts !== null && (
              <span className={`${styles.pts} ${isExact ? styles.ptsExact : pts > 0 ? styles.ptsGood : styles.ptsBad}`}>
                {isExact ? '⚡' : ''}{pts}pts
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
                  <div className={styles.adminResultWrap}>
                    <div className={styles.scoreRow}>
                      <ScoreInput value={localResHome} onChange={v => handleResChange('home', v)} />
                      <span className={styles.sep}>–</span>
                      <ScoreInput value={localResAway} onChange={v => handleResChange('away', v)} />
                    </div>
                    {/* Advancing team picker — only shown for draws */}
                    {isDraw90 && (
                      <div className={styles.advancingPicker}>
                        <span className={styles.advancingLabel}>Who advances?</span>
                        <div className={styles.advancingBtns}>
                          <button
                            className={`${styles.advancingBtn} ${localAdvancing === 'home' ? styles.advancingActive : ''}`}
                            onClick={() => handleAdvancingPick('home')}
                          >{FLAGS[home] || '🏳️'}</button>
                          <button
                            className={`${styles.advancingBtn} ${localAdvancing === 'away' ? styles.advancingActive : ''}`}
                            onClick={() => handleAdvancingPick('away')}
                          >{FLAGS[away] || '🏳️'}</button>
                        </div>
                      </div>
                    )}
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
                    >
                      <span className={styles.predScore}>{predHome} – {predAway}</span>
                      {prediction?.overUnder && (
                        <span className={styles.predMeta}>
                          {prediction.overUnder === 'over' ? 'OVER' : 'UNDER'}
                          {prediction.advancingTeam && (
                            <> · {prediction.advancingTeam === 'home' ? (FLAGS[home] || '🏳️') : (FLAGS[away] || '🏳️')}</>
                          )}
                        </span>
                      )}
                    </button>
                  ) : editable ? (
                    <button className={styles.predictBtn} onClick={() => setModalOpen(true)}>+ Predict</button>
                  ) : locked ? (
                    <span className={styles.lockedChip} title="Locked at kickoff">🔒</span>
                  ) : null
                )}

                {/* Show advancing team result for settled draws */}
                {hasResult && isDraw && resultAdvancing && (
                  <span className={styles.advancingResult}>
                    {resultAdvancing === 'home' ? FLAGS[home] : FLAGS[away]} advances
                  </span>
                )}
              </div>

              <div className={`${styles.team} ${styles.teamRight} ${awayWin ? styles.winner : homeWin ? styles.loser : isDraw ? styles.draw : ''}`}>
                <span className={styles.flag}>{away ? (FLAGS[away] || '🏳️') : '❓'}</span>
                <span className={styles.teamName}>{away ?? match.awayDesc}</span>
              </div>
            </div>
          )}
      </div>

      {modalOpen && (
        <PredictionModal
          match={{ ...match, home, away, group: match.round?.toUpperCase() }}
          prediction={prediction}
          isKnockout={true}
          onSave={(predObj) => onSetPrediction(predObj)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
