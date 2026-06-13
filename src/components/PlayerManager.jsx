import { useState } from 'react';
import { PLAYER_COLORS } from '../data/worldcup';
import styles from './PlayerManager.module.css';

export default function PlayerManager({ players, activePlayer, onAdd, onRemove, onSwitch }) {
  const [name, setName] = useState('');
  const [colorIdx, setColorIdx] = useState(0);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = onAdd(trimmed, PLAYER_COLORS[colorIdx % PLAYER_COLORS.length]);
    onSwitch(id);
    setName('');
    setColorIdx(i => (i + 1) % PLAYER_COLORS.length);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>PLAYERS</h3>
        <span className={styles.count}>{players.length}</span>
      </div>

      {/* Player list */}
      <div className={styles.list}>
        {players.map(p => (
          <div
            key={p.id}
            className={`${styles.player} ${activePlayer === p.id ? styles.active : ''}`}
            style={{ '--pc': p.color }}
            onClick={() => onSwitch(p.id)}
          >
            <span className={styles.dot} />
            <span className={styles.playerName}>{p.name}</span>
            {activePlayer === p.id && <span className={styles.badge}>ACTIVE</span>}
            <button
              className={styles.remove}
              onClick={e => { e.stopPropagation(); onRemove(p.id); }}
              title="Remove player"
            >×</button>
          </div>
        ))}
        {!players.length && (
          <p className={styles.empty}>No players yet</p>
        )}
      </div>

      {/* Add player */}
      <div className={styles.addRow}>
        <div className={styles.colorPicker}>
          {PLAYER_COLORS.map((c, i) => (
            <button
              key={c}
              className={`${styles.colorBtn} ${colorIdx === i ? styles.colorActive : ''}`}
              style={{ background: c }}
              onClick={() => setColorIdx(i)}
            />
          ))}
        </div>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            placeholder="Player name…"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            maxLength={20}
          />
          <button className={styles.addBtn} onClick={handleAdd} disabled={!name.trim()}>
            ADD
          </button>
        </div>
      </div>

      {activePlayer && (
        <p className={styles.hint}>
          Viewing predictions as: <strong>{players.find(p => p.id === activePlayer)?.name}</strong>
        </p>
      )}
    </div>
  );
}
