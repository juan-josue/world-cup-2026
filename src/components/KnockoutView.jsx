import { KNOCKOUT_ROUNDS } from '../data/worldcup';
import KnockoutMatchCard from './KnockoutMatchCard';
import styles from './KnockoutView.module.css';

// Each round's cell height is a multiple of the base --cell value
const ROUND_MULTIPLIERS = { r32: 1, r16: 2, qf: 4, sf: 8, final: 16 };

export default function KnockoutView({
  predictions, results, knockoutTeams, activePlayer,
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
              <div className={styles.roundLabel}>{round.name}</div>

              <div
                className={styles.matches}
                style={{ '--mult': multiplier }}
              >
                {round.matches.map((match, mi) => {
                  // Determine pair position for connector lines
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
                        onSetTeams={(h, a) => onSetTeams(match.id, h, a)}
                        onSetResult={(h, a) => onSetResult(match.id, h, a)}
                        onSetPrediction={(h, a) => onSetPrediction(match.id, h, a)}
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
