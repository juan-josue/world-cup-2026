import { useState } from 'react';
import { PLAYER_COLORS } from '../data/worldcup';
import styles from './PlayerRail.module.css';

const initials = name => name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

export default function PlayerRail({ players, activePlayer, onAdd, onRemove, onSwitch }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [colorIdx, setColorIdx] = useState(0);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = onAdd(trimmed, PLAYER_COLORS[colorIdx % PLAYER_COLORS.length]);
    onSwitch(id);
    setName('');
    setColorIdx(i => (i + 1) % PLAYER_COLORS.length);
    setAdding(false);
  };

  return (
    <div className={styles.rail}>
      <span className={styles.label}>Playing as</span>

      {players.map(p => (
        <div
          key={p.id}
          className={`${styles.chip} ${activePlayer === p.id ? styles.active : ''}`}
          onClick={() => onSwitch(p.id)}
          role="button"
          tabIndex={0}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSwitch(p.id)}
        >
          <span className={styles.dot} style={{ background: p.color }}>{initials(p.name)}</span>
          <span className={styles.name}>{p.name}</span>
          <button
            className={styles.remove}
            onClick={e => { e.stopPropagation(); onRemove(p.id); }}
            title={`Remove ${p.name}`}
          >×</button>
        </div>
      ))}

      {!players.length && !adding && (
        <span className={styles.empty}>Add a player to start predicting →</span>
      )}

      {adding ? (
        <div className={styles.addForm}>
          <div className={styles.swatches}>
            {PLAYER_COLORS.map((c, i) => (
              <button
                key={c}
                className={`${styles.swatch} ${colorIdx === i ? styles.swatchOn : ''}`}
                style={{ background: c }}
                onClick={() => setColorIdx(i)}
                title="Pick colour"
              />
            ))}
          </div>
          <input
            className={styles.input}
            placeholder="Player name…"
            value={name}
            autoFocus
            maxLength={20}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAdding(false); }}
          />
          <button className={styles.addBtn} onClick={submit} disabled={!name.trim()}>Add</button>
          <button className={styles.cancel} onClick={() => { setAdding(false); setName(''); }}>×</button>
        </div>
      ) : (
        <button className={styles.addChip} onClick={() => setAdding(true)}>+ Add player</button>
      )}
    </div>
  );
}
