import { useState } from 'react';
import { KNOCKOUT_ROUNDS } from '../data/worldcup';
import { useMediaQuery } from '../hooks/useMediaQuery';
import KnockoutMatchCard from './KnockoutMatchCard';
import styles from './KnockoutView.module.css';

const ROUND_MULTIPLIERS = { r32: 1, r16: 2, qf: 4, sf: 8, final: 16 };

const ROUND_DATES = {
  r32:   'Jun 28 – Jul 3',
  r16:   'Jul 4 – 7',
  qf:    'Jul 9 – 11',
  sf:    'Jul 14 – 15',
  final: 'Jul 18 – 19',
};

const ROUND_SHORT = { r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF', final: 'Final' };

const roundIdForMatch = (matchId) =>
  KNOCKOUT_ROUNDS.find(r => r.matches.some(m => m.id === matchId))?.id;

export default function KnockoutView({
  predictions, results, knockoutTeams, activePlayer, now, focusMatchId, focusKey,
  onSetPrediction, onSetResult, onClearResult, onSetTeams, isAdmin,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [mobileRound, setMobileRound] = useState(() => {
    const firstOpen = KNOCKOUT_ROUNDS.find(r => r.matches.some(m => !results[m.id]));
    return firstOpen?.id ?? 'r32';
  });

 
  const [seenFocusKey, setSeenFocusKey] = useState(focusKey);
  if (focusKey !== seenFocusKey) {
    setSeenFocusKey(focusKey);
    if (isMobile && focusMatchId) {
      const rid = roundIdForMatch(focusMatchId);
      if (rid) setMobileRound(rid);
    }
  }

  const renderCard = (match, roundId, extraProps = {}) => {
    const teams = knockoutTeams[match.id];
    const result = results[match.id];
    const prediction = activePlayer ? predictions?.[activePlayer]?.[match.id] : undefined;
    return (
      <KnockoutMatchCard
        match={match}
        teams={teams}
        result={result}
        prediction={prediction}
        now={now}
        focusMatchId={focusMatchId}
        focusKey={focusKey}
        roundId={roundId}
        onSetTeams={(h, a) => onSetTeams(match.id, h, a)}
        onSetResult={(h, a, adv) => onSetResult(match.id, h, a, adv)}
        onClearResult={() => onClearResult(match.id)}
        onSetPrediction={(predObj) => onSetPrediction(match.id, predObj)}
        isAdmin={isAdmin}
        activePlayer={activePlayer}
        {...extraProps}
      />
    );
  };

  // ───────────────────────── Mobile ─────────────────────────
  if (isMobile) {
    const round = KNOCKOUT_ROUNDS.find(r => r.id === mobileRound) ?? KNOCKOUT_ROUNDS[0];
    return (
      <div className={styles.mobileWrap}>
        <div className={styles.picker}>
          {KNOCKOUT_ROUNDS.map(r => (
            <button
              key={r.id}
              className={`${styles.chip} ${r.id === mobileRound ? styles.chipOn : ''}`}
              onClick={() => setMobileRound(r.id)}
            >
              {ROUND_SHORT[r.id]}
              <span className={styles.chipCount}>{r.matches.length}</span>
            </button>
          ))}
        </div>

        <div className={styles.roundMeta}>
          <span className={styles.roundMetaName}>{round.name}</span>
          <span className={styles.roundMetaDates}>{ROUND_DATES[round.id]}</span>
        </div>

        <div className={styles.stack}>
          {round.matches.map(match => (
            <div key={match.id} className={styles.stackItem}>
              {renderCard(match, round.id, { mobile: true })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ───────────────────────── Desktop: aligned bracket ─────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.bracket}>
        {KNOCKOUT_ROUNDS.map(round => {
          const multiplier = ROUND_MULTIPLIERS[round.id] ?? 1;
          const isFinalRound = round.id === 'final';

          if (isFinalRound) {
            const finalMatch = round.matches.find(m => m.id === 'FINAL');
            const thirdMatch = round.matches.find(m => m.id === '3RD');
            return (
              <div key={round.id} className={styles.column}>
                <div className={styles.roundLabel}>
                  <span className={styles.roundName}>{round.name}</span>
                  <span className={styles.roundDates}>{ROUND_DATES[round.id]}</span>
                </div>
                <div className={styles.matches}>
                  {finalMatch && (
                    <div className={styles.cell} style={{ '--mult': multiplier }}>
                      {renderCard(finalMatch, round.id, { isLast: true })}
                    </div>
                  )}
                </div>
                {thirdMatch && (
                  <div className={styles.thirdWrap}>
                    <span className={styles.thirdTag}>🥉 3rd-place play-off</span>
                    {renderCard(thirdMatch, round.id, { isLast: true })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={round.id} className={styles.column}>
              <div className={styles.roundLabel}>
                <span className={styles.roundName}>{round.name}</span>
                <span className={styles.roundDates}>{ROUND_DATES[round.id]}</span>
              </div>

              <div className={styles.matches}>
                {round.matches.map((match, mi) => {
                  const pairClass = mi % 2 === 0 ? styles.top : styles.bottom;
                  return (
                    <div
                      key={match.id}
                      className={`${styles.cell} ${styles.hasNext} ${pairClass}`}
                      style={{ '--mult': multiplier }}
                    >
                      {renderCard(match, round.id)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
