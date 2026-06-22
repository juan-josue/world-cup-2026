import { getMissingPredictions } from '../data/worldcup';
import styles from './MissingPredictionsBanner.module.css';

export default function MissingPredictionsBanner({ predictions, activePlayer, knockoutTeams, now, onJump }) {
  const { total, todayCount, firstMatchId, firstTab, firstGroup } = getMissingPredictions({
    predictions, activePlayer, knockoutTeams, now,
  });

  if (!activePlayer || total === 0) return null;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.icon}>⚠️</span>
      <span className={styles.text}>
        You have <strong>{total}</strong> prediction{total !== 1 ? 's' : ''} left
        {todayCount > 0 && (
          <span className={styles.today}> · {todayCount} lock{todayCount !== 1 ? '' : 's'} today</span>
        )}
      </span>
      <button
        className={styles.jump}
        onClick={() => onJump?.({ matchId: firstMatchId, tab: firstTab, group: firstGroup })}
      >
        Predict now →
      </button>
    </div>
  );
}
