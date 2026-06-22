import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_MATCHES, ALL_KNOCKOUT_MATCHES, FLAGS, computeLeaderboard, formatKickoff, liveClock, LIVE_WINDOW_MS } from '../data/worldcup';
import styles from './NextMatchBanner.module.css';

const MEDALS = ['🥇', '🥈', '🥉'];

function getCountdown(target, now) {
  const diff = target - now;
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function fmtHMS(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const pad = n => String(n).padStart(2, '0');

export default function NextMatchBanner({ results, players, predictions, knockoutTeams = {} }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('wc26_bannerCollapsed') === '1'; } catch { return false; }
  });
  const toggle = () => setCollapsed(c => {
    const next = !c;
    try { localStorage.setItem('wc26_bannerCollapsed', next ? '1' : '0'); } catch { /* ignore */ }
    return next;
  });

  const now = Date.now();

  // All fixtures with known teams, sorted by kickoff. Knockout matches only once teams are assigned.
  const fixtures = [
    ...ALL_MATCHES.map(m => ({ id: m.id, ko: Date.parse(m.kickoff), home: m.home, away: m.away, label: `Group ${m.group}` })),
    ...ALL_KNOCKOUT_MATCHES.filter(m => knockoutTeams[m.id]).map(m => ({
      id: m.id, ko: Date.parse(m.kickoff),
      home: knockoutTeams[m.id].home, away: knockoutTeams[m.id].away,
      label: (m.round || '').toUpperCase(),
    })),
  ].sort((a, b) => a.ko - b.ko);

  const live = fixtures.find(f => now >= f.ko && now < f.ko + LIVE_WINDOW_MS && !results[f.id]);
  const upcoming = fixtures.filter(f => f.ko > now);

  const primary = live || upcoming[0] || null;
  const secondary = live ? upcoming[0] : upcoming[1] || null;

  const board = players.length > 0 ? computeLeaderboard(players, predictions, results) : [];
  const hasScores = board.some(p => p.total > 0);

  if (!primary && !hasScores) return null;

  const pKf = primary ? formatKickoff(primary.ko) : null;
  const countdown = primary && !live ? getCountdown(primary.ko, now) : null;
  const clock = live ? liveClock(live.ko, now) : null;
  const progress = clock ? Math.min(100, Math.max(3, clock.progress)) : 0;

  const sKf = secondary ? formatKickoff(secondary.ko) : null;
  const secondaryWhen = secondary ? (live ? `in ${fmtHMS(secondary.ko - now)}` : `${sKf.date} · ${sKf.time}`) : '';

  const collapsedWhen = primary
    ? (live ? clock.label : countdown ? `in ${fmtHMS(primary.ko - now)}` : '')
    : '';

  return (
    <div className={styles.banner}>
      <AnimatePresence mode="wait" initial={false}>
        {primary && (
          <motion.div
            key={collapsed ? 'collapsed' : 'expanded'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {collapsed ? (
        <div className={styles.collapsedBar}>
          {live
            ? <span className={`${styles.cTag} ${styles.cTagLive}`}><span className={styles.dot} />LIVE</span>
            : <span className={`${styles.cTag} ${styles.cTagNext}`}>NEXT</span>}
          <span className={styles.cFlags}>{FLAGS[primary.home] || '🏳️'} {FLAGS[primary.away] || '🏳️'}</span>
          <span className={styles.cTeams}>{primary.home} <span className={styles.upVs}>vs</span> {primary.away}</span>
          {collapsedWhen && <span className={styles.cWhen}>{collapsedWhen}</span>}
          <button className={styles.expandBtn} onClick={toggle} aria-label="Expand match banner" title="Expand">⌄</button>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.top}>
            {live ? (
              <span className={`${styles.tag} ${styles.tagLive}`}><span className={styles.dot} />LIVE NOW</span>
            ) : (
              <span className={`${styles.tag} ${styles.tagNext}`}><span className={`${styles.dot} ${styles.dotNext}`} />NEXT MATCH</span>
            )}
            <div className={styles.topRight}>
              <span className={styles.meta}>{primary.label} · {pKf.date}</span>
              <button className={styles.collapseBtn} onClick={toggle} aria-label="Collapse match banner" title="Collapse">⌃</button>
            </div>
          </div>

          <div className={styles.matchup}>
            <div className={styles.side}>
              <span className={styles.flag}>{FLAGS[primary.home] || '🏳️'}</span>
              <span className={styles.team}>{primary.home}</span>
            </div>
            <div className={styles.center}>
              {live ? (
                <>
                  <span className={styles.minute}>{clock.label}</span>
                  <span className={styles.minLabel}>{clock.phase === 'HT' ? 'half time' : 'in play'}</span>
                </>
              ) : (
                <span className={styles.vs}>VS</span>
              )}
            </div>
            <div className={styles.side}>
              <span className={styles.flag}>{FLAGS[primary.away] || '🏳️'}</span>
              <span className={styles.team}>{primary.away}</span>
            </div>
          </div>

          {live ? (
            <div className={styles.progress}>
              <div className={styles.bar}><div className={styles.fill} style={{ width: `${progress}%` }} /></div>
              <div className={styles.ticks}><span>KO</span><span>HT</span><span>FT 90'</span></div>
            </div>
          ) : countdown ? (
            <div className={styles.clock}>
              {[['days', 'DAYS'], ['hours', 'HRS'], ['minutes', 'MIN'], ['seconds', 'SEC']].map(([k, lbl], i) => (
                <span key={k} className={styles.clockGroup}>
                  {i > 0 && <span className={styles.sep}>:</span>}
                  <span className={`${styles.unit} ${k === 'seconds' ? styles.unitSec : ''}`}>
                    <span className={styles.num}>{pad(countdown[k])}</span>
                    <span className={styles.unitLbl}>{lbl}</span>
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {secondary && (
        <div className={styles.upnext}>
          <span className={styles.upTag}>UP NEXT</span>
          <span className={styles.upFlags}>{FLAGS[secondary.home] || '🏳️'} {FLAGS[secondary.away] || '🏳️'}</span>
          <span className={styles.upTeams}>{secondary.home} <span className={styles.upVs}>vs</span> {secondary.away}</span>
          <span className={styles.upWhen}>{secondaryWhen}</span>
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
