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
import MusicPlayer from './components/MusicPlayer';
import BackToTop from './components/BackToTop';
import Splash from './components/Splash';
import './index.css';
import styles from './App.module.css';

const TABS = ['MATCHES', 'KNOCKOUT', 'LEADERBOARD'];

const appVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function App() {
  const {
    players, predictions, results, activePlayer,
    addPlayer, removePlayer, setPrediction, clearPrediction, setResult, knockoutTeams, setKnockoutTeam, switchPlayer, resetAll, loading,
  } = useStore();

  const [tab, setTab] = useState('MATCHES');
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
    setPrediction(activePlayer, matchId, h, a);
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
                    onSetPrediction={(matchId, h, a) => {
                      if (!activePlayer) return;
                      if (isLocked(matchId)) return;
                      setPrediction(activePlayer, matchId, h, a);
                    }}
                    onSetResult={setResult}
                    onSetTeams={setKnockoutTeam}
                    isAdmin={isAdmin}
                  />
                )}
                {tab === 'LEADERBOARD' && (
                  <Leaderboard
                    players={players}
                    predictions={predictions}
                    results={results}
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
