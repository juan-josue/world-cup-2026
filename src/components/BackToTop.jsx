import { useState, useEffect } from 'react';
import styles from './BackToTop.module.css';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      className={styles.btn}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Jump to top"
      title="Jump to top"
    >
      <span className={styles.arrow}>↑</span> Top
    </button>
  );
}
