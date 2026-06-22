import { getGraceMatches, FLAGS } from '../data/worldcup';
import { useNow } from '../hooks/useNow';
import styles from './GracePeriodBanner.module.css';

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function GracePeriodBanner({ predictions, activePlayer, knockoutTeams, onJump }) {
  const now = useNow(1000); // urgent countdown — tick every second
  const matches = getGraceMatches({ predictions, activePlayer, knockoutTeams, now });

  if (matches.length === 0) return null;

  const m = matches[0];
  const extra = matches.length - 1;
  const remaining = m.lockAt - now;
  const urgent = remaining < 60000;

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.inner}>
        <div className={styles.lead}>
          <span className={styles.live}>
            <span className={styles.dot} />
            LIVE
          </span>
          <span className={styles.matchup}>
            <span className={styles.flag}>{FLAGS[m.home] || '🏳️'}</span>
            <span className={styles.team}>{m.home}</span>
            <span className={styles.vs}>v</span>
            <span className={styles.team}>{m.away}</span>
            <span className={styles.flag}>{FLAGS[m.away] || '🏳️'}</span>
          </span>
        </div>

        <div className={styles.action}>
          <div className={styles.timer}>
            <span className={styles.timerLabel}>Predictions lock in</span>
            <span className={`${styles.timerValue} ${urgent ? styles.urgent : ''}`}>{fmt(remaining)}</span>
          </div>
          <button
            className={styles.jump}
            onClick={() => onJump?.({ matchId: m.id, tab: m.tab, group: m.group })}
          >
            Lock in bet
          </button>
        </div>
      </div>

      {extra > 0 && (
        <div className={styles.more}>+{extra} more match{extra > 1 ? 'es' : ''} closing soon</div>
      )}
    </div>
  );
}
