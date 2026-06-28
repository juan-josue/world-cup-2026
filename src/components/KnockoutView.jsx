import { KNOCKOUT_ROUNDS } from '../data/worldcup';
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

export default function KnockoutView({
  predictions, results, knockoutTeams, activePlayer, now, focusMatchId, focusKey,
  onSetPrediction, onSetResult, onSetTeams, isAdmin,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.bracket}>
        {KNOCKOUT_ROUNDS.map((round, ri) => {
          const multiplier = ROUND_MULTIPLIERS[round.id] ?? 1;
          const isFinalRound = round.id === 'final';

          return (
            <div key={round.id} className={styles.column}>
              <div className={styles.roundLabel}>
                <span className={styles.roundName}>{round.name}</span>
                <span className={styles.roundDates}>{ROUND_DATES[round.id]}</span>
              </div>

              <div
                className={styles.matches}
                style={{ '--mult': multiplier }}
              >
                {round.matches.map((match, mi) => {
                  let pairPosition = 'single';
                  if (!isFinalRound) {
                    pairPosition = mi % 2 === 0 ? 'top' : 'bottom';
                  }

                  const teams = knockoutTeams[match.id];
                  const result = results[match.id];
                  const prediction = activePlayer ? predictions?.[activePlayer]?.[match.id] : undefined;

                  return (
                    <div
                      key={match.id}
                      className={styles.cellWrapper}
                      style={{ height: `calc(var(--cell) * ${multiplier})` }}
                    >
                      <KnockoutMatchCard
                        match={match}
                        teams={teams}
                        result={result}
                        prediction={prediction}
                        now={now}
                        focusMatchId={focusMatchId}
                        focusKey={focusKey}
                        roundId={round.id}
                        onSetTeams={(h, a) => onSetTeams(match.id, h, a)}
                        onSetResult={(h, a, adv) => onSetResult(match.id, h, a, adv)}
                        onSetPrediction={(predObj) => onSetPrediction(match.id, predObj)}
                        isAdmin={isAdmin}
                        activePlayer={activePlayer}
                        pairPosition={pairPosition}
                        isLast={isFinalRound}
                      />
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
