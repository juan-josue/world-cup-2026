import { useState } from 'react';
import { GROUPS } from '../data/worldcup';
import MatchCard from './MatchCard';
import styles from './GroupView.module.css';

const GROUP_KEYS = Object.keys(GROUPS);

export default function GroupView({ predictions, results, activePlayer, onSetPrediction, onSetResult, isAdmin }) {
  const [selected, setSelected] = useState('A');

  const group = GROUPS[selected];

  return (
    <div className={styles.wrap}>
      {/* Group tabs */}
      <div className={styles.tabs}>
        {GROUP_KEYS.map(g => (
          <button
            key={g}
            className={`${styles.tab} ${selected === g ? styles.active : ''}`}
            onClick={() => setSelected(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Group header */}
      <div className={styles.groupHeader}>
        <span className={styles.groupLabel}>GROUP {selected}</span>
        <div className={styles.teams}>
          {group.teams.map(t => <span key={t} className={styles.teamPill}>{t}</span>)}
        </div>
      </div>

      {/* Matches */}
      <div className={styles.matches}>
        {group.matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            groupLabel={`Group ${selected}`}
            prediction={activePlayer ? predictions?.[activePlayer]?.[match.id] : undefined}
            result={results?.[match.id]}
            onSetPrediction={(h, a) => onSetPrediction(match.id, h, a)}
            onSetResult={(h, a) => onSetResult(match.id, h, a)}
            isAdmin={isAdmin}
            activePlayer={activePlayer}
          />
        ))}
      </div>
    </div>
  );
}
