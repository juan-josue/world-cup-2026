import { useState, useEffect } from 'react';
import { ALL_MATCHES, FLAGS, computeLeaderboard } from '../data/worldcup';
import styles from './NextMatchBanner.module.css';

const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

function parseDate(dateStr) {
  const [mon, day] = dateStr.split(' ');
  return new Date(2026, MONTHS[mon], Number(day));
}

function getCountdown(deadline) {
  const diff = deadline - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

const SORTED_MATCHES = [...ALL_MATCHES].sort((a, b) => parseDate(a.date) - parseDate(b.date));

const MEDALS = ['🥇', '🥈', '🥉'];

export default function NextMatchBanner({ results, players, predictions }) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  const next = SORTED_MATCHES.find(m => !results[m.id] && parseDate(m.date) > now);
  const countdown = next ? getCountdown(parseDate(next.date)) : null;

  const board = players.length > 0 ? computeLeaderboard(players, predictions, results) : [];
  const hasScores = board.some(p => p.total > 0);

  if (!next && !hasScores) return null;

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className={styles.banner}>
      {next && countdown && (
        <div className={styles.countdownSection}>
          <div className={styles.matchInfo}>
            <span className={styles.nextLabel}>NEXT MATCH</span>
            <span className={styles.matchTeams}>
              <span className={styles.teamFlag}>{FLAGS[next.home]}</span>
              <span className={styles.teamName}>{next.home}</span>
              <span className={styles.vs}>VS</span>
              <span className={styles.teamName}>{next.away}</span>
              <span className={styles.teamFlag}>{FLAGS[next.away]}</span>
            </span>
            <span className={styles.deadlineNote}>predict before {next.date}</span>
          </div>

          <div className={styles.clock}>
            <div className={styles.clockUnit}>
              <span className={styles.clockNum}>{pad(countdown.days)}</span>
              <span className={styles.clockLabel}>DAYS</span>
            </div>
            <span className={styles.clockSep}>:</span>
            <div className={styles.clockUnit}>
              <span className={styles.clockNum}>{pad(countdown.hours)}</span>
              <span className={styles.clockLabel}>HRS</span>
            </div>
            <span className={styles.clockSep}>:</span>
            <div className={styles.clockUnit}>
              <span className={styles.clockNum}>{pad(countdown.minutes)}</span>
              <span className={styles.clockLabel}>MIN</span>
            </div>
            <span className={styles.clockSep}>:</span>
            <div className={styles.clockUnit}>
              <span className={styles.clockNum}>{pad(countdown.seconds)}</span>
              <span className={styles.clockLabel}>SEC</span>
            </div>
          </div>
        </div>
      )}

      {hasScores && (
        <div className={styles.marqueeSection}>
          <span className={styles.marqueePill}>STANDINGS</span>
          <div className={styles.marqueeTrack}>
            <div className={styles.marqueeInner}>
              {[...board, ...board].map((p, i) => (
                <span key={i} className={styles.marqueeItem}>
                  <span className={styles.marqueeMedal}>
                    {i % board.length < 3 ? MEDALS[i % board.length] : `#${i % board.length + 1}`}
                  </span>
                  <span className={styles.marqueeName} style={{ color: p.color }}>{p.name}</span>
                  <span className={styles.marqueeScore}>{p.total}pts</span>
                  <span className={styles.marqueeDot}>·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
