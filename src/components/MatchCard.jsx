import { useState, useEffect } from 'react';
import { FLAGS, scoreForMatch } from '../data/worldcup';
import PredictionModal from './PredictionModal';
import styles from './MatchCard.module.css';

function ScoreInput({ value, onChange, disabled }) {
  return (
    <input
      type="number"
      min="0"
      max="20"
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
  prediction, result,
  onSetPrediction, onSetResult,
  isAdmin, activePlayer,
}) {
  const { id, date, home, away } = match;
  const hasResult = result !== undefined;
  const hasPred = prediction !== undefined;

  const pts = hasResult && hasPred ? scoreForMatch(prediction, result) : null;

  const predHome = prediction?.homeScore;
  const predAway = prediction?.awayScore;
  const resHome  = result?.homeScore;
  const resAway  = result?.awayScore;

  const [localResHome, setLocalResHome] = useState(resHome ?? '');
  const [localResAway, setLocalResAway] = useState(resAway ?? '');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLocalResHome(resHome ?? '');
    setLocalResAway(resAway ?? '');
  }, [resHome, resAway]);

  const handleResChange = (side, val) => {
    const h = side === 'home' ? val : localResHome;
    const a = side === 'away' ? val : localResAway;
    if (side === 'home') setLocalResHome(val);
    else setLocalResAway(val);
    if (h !== '' && h !== undefined && a !== '' && a !== undefined) {
      onSetResult(h, a);
    }
  };

  // Outcome highlighting
  let homeClass = '', awayClass = '';
  if (hasResult) {
    if (resHome > resAway) { homeClass = styles.winner; awayClass = styles.loser; }
    else if (resAway > resHome) { homeClass = styles.loser; awayClass = styles.winner; }
    else { homeClass = styles.draw; awayClass = styles.draw; }
  }

  const isExact = pts !== null && prediction &&
    Number(predHome) === Number(resHome) && Number(predAway) === Number(resAway);

  return (
    <>
      <div className={`${styles.card} ${hasResult ? styles.settled : ''}`}>
        <div className={styles.meta}>
          <span className={styles.group}>{groupLabel}</span>
          <span className={styles.date}>{date}</span>
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
            {/* Result (admin editable or display) */}
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
            ) : (
              <div className={styles.vsLabel}>VS</div>
            )}

            {/* Prediction button or badge */}
            {activePlayer && (
              hasPred ? (
                <button
                  className={`${styles.predBadge} ${hasResult ? styles.predBadgeLocked : ''}`}
                  onClick={() => !hasResult && setModalOpen(true)}
                  title={hasResult ? 'Match settled' : 'Edit prediction'}
                >
                  {predHome} – {predAway}
                </button>
              ) : !hasResult ? (
                <button className={styles.predictBtn} onClick={() => setModalOpen(true)}>
                  + Predict
                </button>
              ) : null
            )}
          </div>

          <div className={`${styles.team} ${styles.teamAway} ${awayClass}`}>
            <span className={styles.flag}>{FLAGS[away] || '🏳️'}</span>
            <span className={styles.teamName}>{away}</span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <PredictionModal
          match={{ ...match, group: groupLabel }}
          prediction={prediction}
          onSave={(h, a) => onSetPrediction(h, a)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
