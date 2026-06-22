import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './hooks/useStore';
import Leaderboard from './components/Leaderboard';
import GroupView from './components/GroupView';
import PlayerManager from './components/PlayerManager';
import NextMatchBanner from './components/NextMatchBanner';
import KnockoutView from './components/KnockoutView';
import MusicPlayer from './components/MusicPlayer';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [entered, setEntered] = useState(false);
  const musicRef = useRef(null);

  const handleSetPrediction = (matchId, h, a) => {
    if (!activePlayer) return;
    if (h === '' || h === undefined || a === '' || a === undefined) return;
    setPrediction(activePlayer, matchId, h, a);
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
    <>
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
            <header className={styles.header}>
              <div className={styles.headerInner}>
                <div className={styles.logo}>
                  <span className={styles.logoIcon}>⚽</span>
                  <div>
                    <div className={styles.logoTitle}>WC26 BETS</div>
                    <div className={styles.logoSub}>FIFA World Cup 2026 · Group Stage</div>
                  </div>
                </div>
                <nav className={styles.nav}>
                  {TABS.map(t => (
                    <button
                      key={t}
                      className={`${styles.navBtn} ${tab === t ? styles.navActive : ''}`}
                      onClick={() => setTab(t)}
                    >{t}</button>
                  ))}
                  <button
                    className={`${styles.navBtn} ${styles.adminBtn} ${isAdmin ? styles.adminActive : ''}`}
                    onClick={() => setIsAdmin(v => !v)}
                    title="Toggle admin mode to enter match results"
                  >{isAdmin ? '🔓 ADMIN' : '🔒 ADMIN'}</button>
                </nav>
              </div>
              <NextMatchBanner results={results} players={players} predictions={predictions} />
            </header>

            <main className={styles.main}>
              <aside className={styles.sidebar}>
                <PlayerManager
                  players={players}
                  activePlayer={activePlayer}
                  onAdd={addPlayer}
                  onRemove={removePlayer}
                  onSwitch={switchPlayer}
                />
                {isAdmin && (
                  <div className={styles.adminNotice}>
                    <span>🔓</span>
                    <div>
                      <strong>Admin Mode ON</strong>
                      <p>Enter real match results in the Matches tab. Scores auto-calculate.</p>
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
              </aside>

              <section className={styles.content}>
                {tab === 'MATCHES' && (
                  <GroupView
                    predictions={predictions}
                    results={results}
                    activePlayer={activePlayer}
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
                    onSetPrediction={(matchId, h, a) => {
                      if (!activePlayer) return;
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
              </section>
            </main>

            <MusicPlayer ref={musicRef} />
            <footer className={styles.footer}>
              <span>FIFA World Cup 2026 · Jun 11 – Jul 19 · USA, Canada, Mexico</span>
              <span>Predictions stored locally in your browser</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
