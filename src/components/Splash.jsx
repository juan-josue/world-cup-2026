import { motion } from 'framer-motion';
import styles from './Splash.module.css';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  exit: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.7 } },
  exit:   { opacity: 0, y: -20, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.4 } },
};

const ballVariant = {
  hidden: { opacity: 0, scale: 0.4, rotate: -180 },
  show:   { opacity: 1, scale: 1,   rotate: 0,    transition: { ease: [0.22, 1, 0.36, 1], duration: 0.8 } },
  exit:   { opacity: 0, scale: 1.6, rotate: 90,   transition: { ease: [0.22, 1, 0.36, 1], duration: 0.4 } },
};

const overlayExit = {
  exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeInOut', delay: 0.3 } },
};

export default function Splash({ onEnter }) {
  return (
    <motion.div
      className={styles.overlay}
      variants={overlayExit}
      exit="exit"
    >
      <motion.div
        className={styles.content}
        variants={container}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <motion.div className={styles.ball} variants={ballVariant}>⚽</motion.div>

        <motion.div className={styles.title} variants={fadeUp}>
          WC26 BETS
        </motion.div>

        <motion.div className={styles.sub} variants={fadeUp}>
          FIFA World Cup 2026 · Group Stage & Knockout
        </motion.div>

        <motion.div className={styles.meta} variants={fadeUp}>
          USA · Canada · Mexico · Jun 11 – Jul 19
        </motion.div>

        <motion.button
          className={styles.enterBtn}
          variants={fadeUp}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnter}
        >
          Enter & Play Theme
        </motion.button>
      </motion.div>

      {/* Decorative pitch lines */}
      <div className={styles.pitchLines} aria-hidden="true">
        <div className={styles.line} />
        <div className={styles.circle} />
        <div className={styles.line} />
      </div>
    </motion.div>
  );
}
