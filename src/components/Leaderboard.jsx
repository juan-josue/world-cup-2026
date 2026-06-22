import { motion } from 'framer-motion';
import { computeLeaderboard } from '../data/worldcup';
import styles from './Leaderboard.module.css';

const MEDALS = ['🥇','🥈','🥉'];

export default function Leaderboard({ players, predictions, results }) {
  const board = computeLeaderboard(players, predictions, results);
  const totalSettled = Object.keys(results).length;

  if (!players.length) return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>🏆</span>
      <p>Add players to see the leaderboard</p>
    </div>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>LEADERBOARD</h2>
        <span className={styles.sub}>{totalSettled} match{totalSettled !== 1 ? 'es' : ''} settled</span>
      </div>
      <div className={styles.rows}>
        {board.map((player, i) => {
          const isTop = i === 0 && player.total > 0;
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
              <span className={styles.pts}>{player.total}<small>pts</small></span>
            </motion.div>
          );
        })}
      </div>
      <div className={styles.legend}>
        <span>✔ Winner = 1pt</span>
        <span>✔ Exact score (home or away) = +1pt each</span>
        <span>⚡ Exact winner + score = ×2</span>
      </div>
    </div>
  );
}
