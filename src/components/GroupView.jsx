import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GROUPS, ALL_MATCHES, LIVE_WINDOW_MS } from '../data/worldcup';
import MatchCard from './MatchCard';
import styles from './GroupView.module.css';

const GROUP_KEYS = Object.keys(GROUPS);
const OPTIONS = [{ key: 'ALL', label: 'All Groups' }, ...GROUP_KEYS.map(g => ({ key: g, label: `Group ${g}` }))];
const ALL_SORTED = [...ALL_MATCHES].sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));

export default function GroupView({ predictions, results, activePlayer, selectedGroup, onSelectGroup, focusMatchId, focusKey, now, onJump, onSetPrediction, onClearPrediction, onSetResult, isAdmin }) {
  const selected = selectedGroup || 'ALL';
  const isAll = selected === 'ALL';
  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const matches = isAll ? ALL_SORTED : GROUPS[selected].matches.map(m => ({ ...m, group: selected }));
  const currentLabel = OPTIONS.find(o => o.key === selected)?.label ?? 'All Groups';

  // "Latest game": the live match if one is on, otherwise the next to kick off.
  let liveMatch = null, nextMatch = null;
  if (isAll) {
    for (const m of ALL_SORTED) {
      const ko = Date.parse(m.kickoff);
      if (!liveMatch && now >= ko && now < ko + LIVE_WINDOW_MS && !results?.[m.id]) liveMatch = m;
      if (!nextMatch && ko > now) nextMatch = m;
    }
  }
  const jumpTarget = liveMatch || nextMatch;

  return (
    <div className={styles.wrap}>
      {/* Group dropdown */}
      <div className={styles.toolbar}>
        <div className={styles.dropdown} ref={ddRef}>
          <button className={styles.ddTrigger} onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}>
            <span className={styles.ddLabel}>{currentLabel}</span>
            <span className={`${styles.ddCaret} ${open ? styles.ddCaretOpen : ''}`}>▾</span>
          </button>
          <AnimatePresence>
            {open && (
            <motion.ul
              className={styles.ddMenu}
              role="listbox"
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
              {OPTIONS.map(o => (
                <li key={o.key}>
                  <button
                    className={`${styles.ddItem} ${selected === o.key ? styles.ddItemActive : ''}`}
                    role="option"
                    aria-selected={selected === o.key}
                    onClick={() => { onSelectGroup(o.key); setOpen(false); }}
                  >
                    {o.label}
                    {selected === o.key && <span className={styles.ddCheck}>✓</span>}
                  </button>
                </li>
              ))}
            </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <span className={styles.count}>{matches.length} matches{isAll ? ' · in kickoff order' : ''}</span>
        {isAll && jumpTarget && onJump && (
          <button
            className={styles.jumpBtn}
            onClick={() => onJump({ matchId: jumpTarget.id })}
            title={liveMatch ? 'Scroll to the match in progress' : 'Scroll to the next kickoff'}
          >
            <span className={`${styles.jumpDot} ${liveMatch ? styles.jumpDotLive : ''}`} />
            {liveMatch ? 'Jump to live' : 'Jump to next'}
          </button>
        )}
      </div>

      {/* Group header (specific group only) */}
      {!isAll && (
        <div className={styles.groupHeader}>
          <span className={styles.groupLabel}>GROUP {selected}</span>
          <div className={styles.teams}>
            {GROUPS[selected].teams.map(t => <span key={t} className={styles.teamPill}>{t}</span>)}
          </div>
        </div>
      )}

      {/* Matches (with day dividers in the chronological All-Groups view) */}
      <motion.div
        key={selected}
        className={`${styles.matches} ${isAll ? styles.matchesAll : ''}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {(() => {
          const out = [];
          let lastDay = null;
          for (const match of matches) {
            if (isAll) {
              const dl = new Date(match.kickoff).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              if (dl !== lastDay) { out.push(<div key={`day-${match.id}`} className={styles.dayHead}>{dl}</div>); lastDay = dl; }
            }
            out.push(
              <MatchCard
                key={match.id}
                match={match}
                groupLabel={`Group ${match.group}`}
                prediction={activePlayer ? predictions?.[activePlayer]?.[match.id] : undefined}
                result={results?.[match.id]}
                now={now}
                focusMatchId={focusMatchId}
                focusKey={focusKey}
                onSetPrediction={(h, a) => onSetPrediction(match.id, h, a)}
                onClearPrediction={() => onClearPrediction(match.id)}
                onSetResult={(h, a) => onSetResult(match.id, h, a)}
                isAdmin={isAdmin}
                activePlayer={activePlayer}
              />
            );
          }
          return out;
        })()}
      </motion.div>
    </div>
  );
}
