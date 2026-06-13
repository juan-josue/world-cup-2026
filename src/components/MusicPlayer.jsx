import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import themeSrc from '../assets/theme.mp3';
import styles from './MusicPlayer.module.css';

const MusicPlayer = forwardRef(function MusicPlayer(_, ref) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(themeSrc);
    audio.loop = true;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // App calls this when the user clicks "Enter" on the splash screen
  useImperativeHandle(ref, () => ({
    play: () => {
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
    },
  }));

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <button
      className={`${styles.btn} ${playing ? styles.playing : ''}`}
      onClick={toggle}
      title={playing ? 'Mute theme' : 'Play World Cup theme'}
    >
      {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      {playing && <span className={styles.bars}><i /><i /><i /></span>}
    </button>
  );
});

export default MusicPlayer;
