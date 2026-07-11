import { useState, useRef } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useStore } from './hooks/useStore';
import { useNow } from './hooks/useNow';
import { isLocked } from './data/worldcup';
import Leaderboard from './components/Leaderboard';
import GroupView from './components/GroupView';
import PlayerRail from './components/PlayerRail';
import NextMatchBanner from './components/NextMatchBanner';
import MissingPredictionsBanner from './components/MissingPredictionsBanner';
import GracePeriodBanner from './components/GracePeriodBanner';
import KnockoutView from './components/KnockoutView';
import Movers from './components/Movers';
import RaceChart from './components/RaceChart';
import MusicPlayer from './components/MusicPlayer';
import BackToTop from './components/BackToTop';
import Splash from './components/Splash';
import './index.css';
import styles from './App.module.css';

const TABS = ['MATCHES', 'KNOCKOUT', 'MOVERS', 'RACE', 'LEADERBOARD'];

const appVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function App() {
  const {
    players, predictions, results, activePlayer,
    addPlayer, removePlayer, setPrediction, clearPrediction, setResult, clearResult, knockoutTeams, setKnockoutTeam, switchPlayer, setBonusPoints, resetAll, seedR32Teams, seedR16Teams, seedQFTeams, fixQF2QF3Swap, loading,
  } = useStore();

  const [tab, setTab] = useState('KNOCKOUT');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [focusMatchId, setFocusMatchId] = useState(null);
  const [focusKey, setFocusKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [entered, setEntered] = useState(false);
  const musicRef = useRef(null);
  const now = useNow(30000);

  const handleSetPrediction = (matchId, h, a) => {
    if (!activePlayer) return;
    if (isLocked(matchId)) return;
    if (h === '' || h === undefined || a === '' || a === undefined) return;
    setPrediction(activePlayer, matchId, { homeScore: h, awayScore: a });
  };

  const handleJumpToMissing = ({ matchId, tab: jumpTab, group }) => {
    if (jumpTab) setTab(jumpTab);
    if (group) setSelectedGroup(group);
    if (matchId) {
      setFocusMatchId(matchId);
      setFocusKey(k => k + 1); // bump so re-clicking the same match re-triggers the flash
    }
  };

  const handleClearPrediction = (matchId) => {
    if (!activePlayer) return;
    clearPrediction(activePlayer, matchId);
  };

  const handleEnter = () => {
    musicRef.current?.play();
    setEntered(true);
  };

  if (loading) return (
    <div className={styles.loader}><span>⚽</span></div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!entered && <Splash key="splash" onEnter={handleEnter} />}
      </AnimatePresence>

      <AnimatePresence>
        {entered && (
          <motion.div
            key="app"
            className={styles.app}
            variants={appVariants}
            initial="hidden"
            animate="show"
          >
            <GracePeriodBanner
              predictions={predictions}
              activePlayer={activePlayer}
              knockoutTeams={knockoutTeams}
              onJump={handleJumpToMissing}
            />
            <header className={styles.header}>
              <div className={styles.headerInner}>
                <div className={styles.logo}>
                  <span className={styles.crest}>⚽</span>
                  <div>
                    <div className={styles.logoTitle}>WC26 BETS</div>
                    <div className={styles.logoSub}>World Cup 2026 · Prediction Pool</div>
                  </div>
                </div>
                <nav className={styles.nav}>
                  <div className={styles.navSeg}>
                    {TABS.map(t => (
                      <button
                        key={t}
                        className={`${styles.navBtn} ${tab === t ? styles.navActive : ''}`}
                        onClick={() => setTab(t)}
                      >{t}</button>
                    ))}
                  </div>
                  <button
                    className={`${styles.adminBtn} ${isAdmin ? styles.adminActive : ''}`}
                    onClick={() => setIsAdmin(v => !v)}
                    title="Toggle admin mode to enter match results"
                  >{isAdmin ? '🔓 ADMIN' : '🔒 ADMIN'}</button>
                </nav>
              </div>
              <NextMatchBanner results={results} players={players} predictions={predictions} knockoutTeams={knockoutTeams} />
              <MissingPredictionsBanner
                predictions={predictions}
                activePlayer={activePlayer}
                knockoutTeams={knockoutTeams}
                now={now}
                onJump={handleJumpToMissing}
              />
            </header>

            <main className={styles.main}>
              <PlayerRail
                players={players}
                activePlayer={activePlayer}
                onAdd={addPlayer}
                onRemove={removePlayer}
                onSwitch={switchPlayer}
              />

              {isAdmin && (
                <div className={styles.adminNotice}>
                  <span className={styles.adminIcon}>🔓</span>
                  <div className={styles.adminText}>
                    <strong>Admin mode on</strong>
                    <p>Enter real match results in the Matches tab — scores auto-calculate.</p>
                  </div>
                  <button
                    className={styles.seedBtn}
                    onClick={() => {
                      if (window.confirm('Seed all 16 Round of 32 teams from the actual 2026 bracket? This will overwrite any existing R32 team assignments.')) {
                        seedR32Teams();
                      }
                    }}
                  >Seed R32 Teams</button>
                  <button
                    className={styles.seedBtn}
                    onClick={() => {
                      if (window.confirm('Seed all 8 Round of 16 teams from actual results? This will overwrite any existing R16 team assignments.')) {
                        seedR16Teams();
                      }
                    }}
                  >Seed R16 Teams</button>
                  <button
                    className={styles.seedBtn}
                    onClick={() => {
                      if (window.confirm('Fix QF team assignments? This sets QF1=France/Morocco, QF2=Spain/Belgium, QF3=Norway/England, QF4=Argentina/Switzerland. Predictions and results are NOT affected.')) {
                        seedQFTeams();
                      }
                    }}
                  >Fix QF Teams</button>
                  <button
                    className={styles.seedBtn}
                    style={{ borderColor: '#d94f3d', color: '#d94f3d' }}
                    onClick={() => {
                      if (window.confirm('Fix QF2/QF3 data swap?\n\nThis moves all predictions and results from QF3 → QF2 (Spain/Belgium), fixes the SF1 bracket, and removes Spain from SF2.\n\nAll scores and predictions are preserved — only which slot they belong to is corrected.\n\nRun this ONCE to repair the corrupted state.')) {
                        fixQF2QF3Swap();
                      }
                    }}
                  >Fix QF2/QF3 Swap</button>
                  <button
                    className={styles.resetBtn}
                    onClick={() => {
                      if (window.confirm('Reset everything? This will delete all players, predictions, and results.')) {
                        resetAll();
                        setIsAdmin(false);
                      }
                    }}
                  >Reset all</button>
                </div>
              )}

              <section className={styles.content}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                {tab === 'MATCHES' && (
                  <GroupView
                    predictions={predictions}
                    results={results}
                    activePlayer={activePlayer}
                    selectedGroup={selectedGroup}
                    onSelectGroup={setSelectedGroup}
                    focusMatchId={focusMatchId}
                    focusKey={focusKey}
                    onJump={handleJumpToMissing}
                    now={now}
                    onSetPrediction={handleSetPrediction}
                    onClearPrediction={handleClearPrediction}
                    onSetResult={setResult}
                    isAdmin={isAdmin}
                  />
                )}
                {tab === 'KNOCKOUT' && (
                  <KnockoutView
                    predictions={predictions}
                    results={results}
                    knockoutTeams={knockoutTeams}
                    activePlayer={activePlayer}
                    now={now}
                    focusMatchId={focusMatchId}
                    focusKey={focusKey}
                    onSetPrediction={(matchId, predObj) => {
                      if (!activePlayer) return;
                      if (isLocked(matchId)) return;
                      setPrediction(activePlayer, matchId, predObj);
                    }}
                    onSetResult={setResult}
                    onClearResult={clearResult}
                    onSetTeams={setKnockoutTeam}
                    isAdmin={isAdmin}
                  />
                )}
                {tab === 'MOVERS' && (
                  <Movers
                    players={players}
                    predictions={predictions}
                    results={results}
                    knockoutTeams={knockoutTeams}
                  />
                )}
                {tab === 'RACE' && (
                  <RaceChart
                    players={players}
                    predictions={predictions}
                    results={results}
                  />
                )}
                {tab === 'LEADERBOARD' && (
                  <Leaderboard
                    players={players}
                    predictions={predictions}
                    results={results}
                    isAdmin={isAdmin}
                    onSetBonusPoints={setBonusPoints}
                  />
                )}
                  </motion.div>
                </AnimatePresence>
              </section>
            </main>

            <MusicPlayer ref={musicRef} />
            <BackToTop />
            <footer className={styles.footer}>
              <span>FIFA World Cup 2026 · Jun 11 – Jul 19 · USA, Canada, Mexico</span>
              <span>Predictions stored locally in your browser</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
