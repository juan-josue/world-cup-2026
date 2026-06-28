import { useState } from 'react';
import { motion } from 'framer-motion';
import { computeLeaderboard } from '../data/worldcup';
import styles from './Leaderboard.module.css';

const MEDALS = ['🥇','🥈','🥉'];

export default function Leaderboard({ players, predictions, results, isAdmin, onSetBonusPoints }) {
  const board = computeLeaderboard(players, predictions, results);
  const totalSettled = Object.keys(results).length;
  const [drafts, setDrafts] = useState({});

  if (!players.length) return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>🏆</span>
      <p>Add players to see the leaderboard</p>
    </div>
  );

  const handleBonusChange = (playerId, val) => {
    setDrafts(d => ({ ...d, [playerId]: val }));
  };

  const commitBonus = (playerId) => {
    const val = drafts[playerId];
    if (val === undefined || val === '') return;
    const n = parseInt(val, 10);
    if (!isNaN(n)) onSetBonusPoints(playerId, n);
    setDrafts(d => { const next = { ...d }; delete next[playerId]; return next; });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>LEADERBOARD</h2>
        <span className={styles.sub}>{totalSettled} match{totalSettled !== 1 ? 'es' : ''} settled</span>
      </div>
      <div className={styles.rows}>
        {board.map((player, i) => {
          const isTop = i === 0 && player.total > 0;
          const bonus = player.bonusPoints ?? 0;
          const draftVal = drafts[player.id] !== undefined ? drafts[player.id] : String(bonus || '');
          return (
            <motion.div
              key={player.id}
              className={`${styles.row} ${isTop ? styles.top : ''}`}
              style={{ '--player-color': player.color }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={styles.rank}>
                {i < 3 && player.total > 0 ? MEDALS[i] : `#${i + 1}`}
              </span>
              <span className={styles.dot} />
              <span className={styles.name}>{player.name}</span>
              <div className={styles.bar}>
                <div
                  className={styles.fill}
                  style={{ width: board[0]?.total ? `${(player.total / board[0].total) * 100}%` : '0%' }}
                />
              </div>
              {isAdmin ? (
                <div className={styles.bonusWrap}>
                  <label className={styles.bonusLabel}>bonus</label>
                  <input
                    type="number"
                    className={styles.bonusInput}
                    value={draftVal}
                    onChange={e => handleBonusChange(player.id, e.target.value)}
                    onBlur={() => commitBonus(player.id)}
                    onKeyDown={e => e.key === 'Enter' && commitBonus(player.id)}
                    title="Bonus/penalty points (can be negative)"
                  />
                </div>
              ) : bonus !== 0 ? (
                <span className={`${styles.bonusBadge} ${bonus < 0 ? styles.bonusBadgeNeg : ''}`}>
                  {bonus > 0 ? '+' : ''}{bonus}
                </span>
              ) : null}
              <span className={styles.pts}>{player.total}<small>pts</small></span>
            </motion.div>
          );
        })}
      </div>
      <div className={styles.legend}>
        <span className={styles.legendHeading}>Group stage</span>
        <span>✔ Correct winner = 1pt · correct score (home or away) = +1pt each · exact score = ×2 · max 6pts</span>
        <span className={styles.legendHeading}>Knockout stage</span>
        <span>✔ Correct winner = 2pts · correct score = +2pts each · exact score = ×2 · max 12pts</span>
        <span>⚽ Correct over/under 2.5 goals (90 min) = +2pts</span>
        <span>🏆 Correct team to advance (incl. extra time &amp; pens) = +2pts · max 16pts per match</span>
      </div>
    </div>
  );
}
