import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FLAGS } from '../data/worldcup';
import styles from './PredictionModal.module.css';

export default function PredictionModal({ match, prediction, onSave, onClose }) {
  const [home, setHome] = useState(prediction?.homeScore ?? '');
  const [away, setAway] = useState(prediction?.awayScore ?? '');

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const canSave = home !== '' && away !== '';

  const handleSave = () => {
    if (!canSave) return;
    onSave(Number(home), Number(away));
    onClose();
  };

  return createPortal(
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.tag}>Group {match.group} · {match.date}</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.teams}>
          <div className={styles.team}>
            <span className={styles.flag}>{FLAGS[match.home] || '🏳️'}</span>
            <span className={styles.teamName}>{match.home}</span>
          </div>
          <span className={styles.vs}>VS</span>
          <div className={`${styles.team} ${styles.teamRight}`}>
            <span className={styles.teamName}>{match.away}</span>
            <span className={styles.flag}>{FLAGS[match.away] || '🏳️'}</span>
          </div>
        </div>

        <p className={styles.label}>Your prediction</p>

        <div className={styles.inputs}>
          <input
            className={styles.scoreInput}
            type="number"
            min="0"
            max="20"
            placeholder="0"
            value={home}
            onChange={e => setHome(e.target.value === '' ? '' : Number(e.target.value))}
            autoFocus
          />
          <span className={styles.dash}>–</span>
          <input
            className={styles.scoreInput}
            type="number"
            min="0"
            max="20"
            placeholder="0"
            value={away}
            onChange={e => setAway(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

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
