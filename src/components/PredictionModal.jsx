import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FLAGS } from '../data/worldcup';
import styles from './PredictionModal.module.css';

export default function PredictionModal({ match, prediction, isKnockout, onSave, onClose }) {
  const [home, setHome] = useState(prediction?.homeScore ?? '');
  const [away, setAway] = useState(prediction?.awayScore ?? '');
  const [overUnder, setOverUnder] = useState(prediction?.overUnder ?? null);
  const [advancingTeam, setAdvancingTeam] = useState(prediction?.advancingTeam ?? null);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const scoresFilled = home !== '' && away !== '';
  const canSave = scoresFilled && (!isKnockout || (overUnder && advancingTeam));

  const handleSave = () => {
    if (!canSave) return;
    const predObj = { homeScore: Number(home), awayScore: Number(away) };
    if (isKnockout) {
      predObj.overUnder = overUnder;
      predObj.advancingTeam = advancingTeam;
    }
    onSave(predObj);
    onClose();
  };

  const homeTeam = match.home;
  const awayTeam = match.away;

  return createPortal(
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.tag}>
            {isKnockout ? '⚡ Knockout' : `Group ${match.group}`} · {match.date}
          </span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.teams}>
          <div className={styles.team}>
            <span className={styles.flag}>{FLAGS[homeTeam] || '🏳️'}</span>
            <span className={styles.teamName}>{homeTeam}</span>
          </div>
          <span className={styles.vs}>VS</span>
          <div className={`${styles.team} ${styles.teamRight}`}>
            <span className={styles.teamName}>{awayTeam}</span>
            <span className={styles.flag}>{FLAGS[awayTeam] || '🏳️'}</span>
          </div>
        </div>

        {/* ── Score ── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>
            Predict the score
            {isKnockout && <span className={styles.sectionNote}> — 90 minutes only, not including extra time</span>}
          </p>
          <div className={styles.inputs}>
            <input
              className={styles.scoreInput}
              type="number" min="0" max="20" placeholder="0"
              value={home}
              onChange={e => setHome(e.target.value === '' ? '' : Number(e.target.value))}
              autoFocus
            />
            <span className={styles.dash}>–</span>
            <input
              className={styles.scoreInput}
              type="number" min="0" max="20" placeholder="0"
              value={away}
              onChange={e => setAway(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </div>

        {/* ── Knockout extras ── */}
        {isKnockout && (
          <>
            {/* Over / Under */}
            <div className={styles.section}>
              <p className={styles.sectionLabel}>
                Over or under 2.5 goals?
                <span className={styles.sectionNote}> — total goals at 90 min · +2 pts</span>
              </p>
              <div className={styles.toggleRow}>
                <button
                  className={`${styles.toggleBtn} ${overUnder === 'over' ? styles.toggleActive : ''}`}
                  onClick={() => setOverUnder('over')}
                >
                  <span className={styles.toggleMain}>OVER 2.5</span>
                  <span className={styles.toggleSub}>3 or more goals</span>
                </button>
                <button
                  className={`${styles.toggleBtn} ${overUnder === 'under' ? styles.toggleActive : ''}`}
                  onClick={() => setOverUnder('under')}
                >
                  <span className={styles.toggleMain}>UNDER 2.5</span>
                  <span className={styles.toggleSub}>2 or fewer goals</span>
                </button>
              </div>
            </div>

            {/* Who advances */}
            <div className={styles.section}>
              <p className={styles.sectionLabel}>
                Who advances?
                <span className={styles.sectionNote}> — includes extra time &amp; penalties · +2 pts</span>
              </p>
              <div className={styles.toggleRow}>
                <button
                  className={`${styles.toggleBtn} ${styles.toggleTeam} ${advancingTeam === 'home' ? styles.toggleActive : ''}`}
                  onClick={() => setAdvancingTeam('home')}
                >
                  <span className={styles.toggleFlag}>{FLAGS[homeTeam] || '🏳️'}</span>
                  <span className={styles.toggleMain}>{homeTeam}</span>
                </button>
                <button
                  className={`${styles.toggleBtn} ${styles.toggleTeam} ${advancingTeam === 'away' ? styles.toggleActive : ''}`}
                  onClick={() => setAdvancingTeam('away')}
                >
                  <span className={styles.toggleFlag}>{FLAGS[awayTeam] || '🏳️'}</span>
                  <span className={styles.toggleMain}>{awayTeam}</span>
                </button>
              </div>
            </div>
          </>
        )}

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.save} onClick={handleSave} disabled={!canSave}>
            Save prediction
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
