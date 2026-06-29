import { motion } from 'framer-motion';
import { FLAGS, computeMovers, formatKickoff } from '../data/worldcup';
import styles from './Movers.module.css';

const ROUND_LABEL = { r32: 'R32', r16: 'R16', qf: 'Quarter-final', sf: 'Semi-final', final: 'Final' };

const roundLabel = (matchId, roundId) =>
  matchId === '3RD' ? '3rd place' : (ROUND_LABEL[roundId] ?? '');

function Swing({ s, maxPts }) {
  const width = maxPts > 0 ? Math.round((s.pts / maxPts) * 100) : 0;
  const gainClass = [
    styles.gain,
    s.pts === 0 ? styles.gainZero : '',
    s.exact ? styles.gainExact : '',
  ].filter(Boolean).join(' ');
  return (
    <div className={`${styles.swing} ${s.isTopMover ? styles.swingTop : ''}`}>
      <span className={styles.who}>
        <span className={styles.pdot} style={{ background: s.color || 'var(--text-dim)' }} />
        <span className={styles.nm}>{s.name}</span>
        {!s.hasPred && <span className={styles.noPred}>no pick</span>}
        <span className={styles.bar}><span className={styles.barFill} style={{ width: `${width}%` }} /></span>
      </span>
      <span className={gainClass}>{s.exact ? '⚡ ' : ''}{s.pts > 0 ? '+' : ''}{s.pts}</span>
    </div>
  );
}

export default function Movers({ players, predictions, results, knockoutTeams }) {
  const feed = computeMovers(players, predictions, results);

  if (!players.length) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📈</span>
        <p>Add players to start tracking point swings.</p>
      </div>
    );
  }

  if (!feed.length) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📈</span>
        <p>No knockout matches settled yet.</p>
        <span className={styles.emptySub}>Point swings and lead changes appear here as results come in.</span>
      </div>
    );
  }

  // ── Summary strip ──
  const current = feed[0]; // newest match holds the latest standings
  const hot = {};
  feed.slice(0, 3).forEach(f => f.swings.forEach(s => { hot[s.id] = (hot[s.id] ?? 0) + s.pts; }));
  const hottest = Object.entries(hot)
    .map(([id, pts]) => ({ ...players.find(p => p.id === id), pts }))
    .filter(p => p.id)
    .sort((a, b) => b.pts - a.pts)[0];
  const lastChange = feed.find(f => f.leaderChanged);

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <div className={styles.stat}>
          <div className={styles.statTop}>👑 Current leader</div>
          <div className={styles.statMain}>
            <span className={styles.statName}>{current.leaderName ?? '—'}</span>
            {current.leaderName && <span className={styles.statSub}>{current.leaderTotal} pts</span>}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statTop}>🔥 Hottest · last {Math.min(3, feed.length)}</div>
          <div className={styles.statMain}>
            {hottest && hottest.pts > 0 ? (
              <>
                <span className={styles.pdot} style={{ background: hottest.color }} />
                <span className={styles.statName}>{hottest.name}</span>
                <span className={styles.statSub}>+{hottest.pts} pts</span>
              </>
            ) : <span className={styles.statName}>—</span>}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statTop}>↕ Last lead change</div>
          {lastChange ? (
            <>
              <div className={styles.statName}>{lastChange.leaderName} ▲</div>
              <div className={styles.statSub}>
                {lastChange.prevLeaderName ? `overtook ${lastChange.prevLeaderName}` : 'first to the top'}
              </div>
            </>
          ) : <div className={styles.statName} style={{ color: 'var(--text-muted)' }}>none yet</div>}
        </div>
      </div>

      <div className={styles.feed}>
        {feed.map((f, i) => {
          const teams = knockoutTeams?.[f.matchId];
          const home = teams?.home ?? f.match.homeDesc;
          const away = teams?.away ?? f.match.awayDesc;
          const { homeScore: hs, awayScore: as, advancingTeam } = f.result;
          const homeWin = hs > as || (hs === as && advancingTeam === 'home');
          const awayWin = as > hs || (hs === as && advancingTeam === 'away');
          const isDraw = hs === as;
          const { date, time } = formatKickoff(f.match.kickoff);

          return (
            <motion.div
              key={f.matchId}
              className={styles.item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
            >
              <div className={styles.spine} />
              <div className={`${styles.when} ${f.leaderChanged ? styles.whenBig : ''}`}>
                <div className={styles.whenDate}>{date}</div>
                <div className={styles.whenTime}>{time}</div>
                <div className={styles.whenRound}>{roundLabel(f.matchId, f.match.round)}</div>
              </div>

              <div className={`${styles.card} ${f.leaderChanged ? styles.cardLead : ''}`}>
                {f.leaderChanged && (
                  <div className={styles.leadFlag}>👑 {f.leaderName} takes the lead</div>
                )}

                <div className={styles.scoreline}>
                  <div className={`${styles.sside} ${homeWin ? styles.win : styles.lose}`}>
                    <span className={styles.sflag}>{FLAGS[home] || '🏳️'}</span>
                    <span className={styles.sname}>{home}</span>
                  </div>
                  <div className={styles.sscore}>
                    <span className={homeWin ? styles.scW : ''}>{hs}</span>
                    <span className={styles.scDash}>–</span>
                    <span className={awayWin ? styles.scW : ''}>{as}</span>
                  </div>
                  <div className={`${styles.sside} ${styles.ssideR} ${awayWin ? styles.win : styles.lose}`}>
                    <span className={styles.sflag}>{FLAGS[away] || '🏳️'}</span>
                    <span className={styles.sname}>{away}</span>
                  </div>
                </div>

                {isDraw && advancingTeam && (
                  <div className={styles.advNote}>
                    {FLAGS[advancingTeam === 'home' ? home : away] || '🏳️'}{' '}
                    {advancingTeam === 'home' ? home : away} advanced (ET / pens)
                  </div>
                )}

                <div className={styles.swings}>
                  {f.swings.map(s => <Swing key={s.id} s={s} maxPts={f.maxPts} />)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className={styles.legend}>
        Swings show knockout points per match. Standings include group stage &amp; bonus.
      </p>
    </div>
  );
}
