import { useState, useRef, useEffect, useCallback } from 'react';
import { computeStandingsHistory, formatKickoff } from '../data/worldcup';
import styles from './RaceChart.module.css';

// viewBox geometry — the SVG scales to its container width.
const W = 720, H = 340;
const PAD = { t: 18, r: 78, b: 30, l: 38 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const MIN_SPAN = 3; // closest zoom: ~3 matches across

// Round a raw step up to a "nice" 1/2/5 × 10ⁿ value for readable axis ticks.
function niceStep(raw) {
  if (raw <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return nice * mag;
}

export default function RaceChart({ players, predictions, results }) {
  const { steps } = computeStandingsHistory(players, predictions, results);
  const n = steps.length;
  const koIndex = steps.findIndex(s => s.knockout);
  const canRender = players.length > 0 && n >= 2;

  const [view, setViewState] = useState({ s: 0, e: Math.max(1, n - 1) });
  const [scrubIdx, setScrubState] = useState(null);
  const [activeRange, setActiveRange] = useState('all');
  const [prevN, setPrevN] = useState(n);

  const svgRef = useRef(null);
  const viewRef = useRef(view);
  const scrubRef = useRef(scrubIdx);
  const nRef = useRef(n);
  const pointers = useRef(new Map());
  const mode = useRef(null);          // 'scrub' | 'pan' | 'pinch'
  const panX = useRef(0);
  const pinch = useRef({ dist: 0, cx: 0 });

  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { scrubRef.current = scrubIdx; }, [scrubIdx]);
  useEffect(() => { nRef.current = n; }, [n]);

  // Reset the window when the dataset grows (a result was entered) — adjust state
  // during render (the React-endorsed pattern), keyed on the step count.
  if (n !== prevN) {
    setPrevN(n);
    setViewState({ s: 0, e: Math.max(1, n - 1) });
    setScrubState(null);
    setActiveRange('all');
  }

  // ── stable gesture helpers (read live refs) ──
  const setView = useCallback(v => { viewRef.current = v; setViewState(v); }, []);
  const setScrub = useCallback(i => { scrubRef.current = i; setScrubState(i); }, []);

  const fracFromClientX = useCallback(cx => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const r = svg.getBoundingClientRect();
    const scale = r.width / W;
    const left = r.left + PAD.l * scale;
    const right = r.left + (W - PAD.r) * scale;
    return Math.max(0, Math.min(1, (cx - left) / (right - left)));
  }, []);

  const doScrub = useCallback(cx => {
    const v = viewRef.current;
    const idx = v.s + fracFromClientX(cx) * Math.max(0.0001, v.e - v.s);
    setScrub(Math.max(0, Math.min(nRef.current - 1, Math.round(idx))));
  }, [fracFromClientX, setScrub]);
  const clearScrub = useCallback(() => { if (scrubRef.current !== null) setScrub(null); }, [setScrub]);

  const zoomAround = useCallback((cx, factor) => {
    const v = viewRef.current;
    const N = nRef.current;
    const f = fracFromClientX(cx);
    const cur = Math.max(0.0001, v.e - v.s);
    const focal = v.s + f * cur;
    const newSpan = Math.max(MIN_SPAN, Math.min(N - 1, cur * factor));
    let s = focal - f * newSpan;
    let e = s + newSpan;
    if (s < 0) { s = 0; e = newSpan; }
    if (e > N - 1) { e = N - 1; s = e - newSpan; }
    setView({ s: Math.max(0, s), e: Math.min(N - 1, e) });
    setActiveRange(null);
  }, [fracFromClientX, setView]);

  const panByPx = useCallback(dx => {
    const v = viewRef.current;
    const N = nRef.current;
    const svg = svgRef.current;
    if (!svg) return;
    const pxW = PLOT_W * (svg.getBoundingClientRect().width / W);
    const dIdx = (dx / pxW) * Math.max(0.0001, v.e - v.s);
    let s = v.s - dIdx;
    let e = v.e - dIdx;
    if (s < 0) { e -= s; s = 0; }
    if (e > N - 1) { s -= (e - (N - 1)); e = N - 1; }
    setView({ s: Math.max(0, s), e: Math.min(N - 1, e) });
    setActiveRange(null);
  }, [setView]);

  // Non-passive wheel listener so we can preventDefault page scroll while zooming.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !canRender) return;
    const onWheel = e => {
      e.preventDefault();
      zoomAround(e.clientX, e.deltaY < 0 ? 0.85 : 1 / 0.85);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [canRender, zoomAround]);

  // ── gesture handlers ──
  const onPointerDown = e => {
    pointers.current.set(e.pointerId, e);
    if (e.pointerType !== 'touch') {
      mode.current = 'pan';
      panX.current = e.clientX;
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (pointers.current.size === 1) {
      mode.current = 'scrub';
      doScrub(e.clientX);
    } else if (pointers.current.size === 2) {
      mode.current = 'pinch';
      const a = [...pointers.current.values()];
      pinch.current = { dist: Math.abs(a[0].clientX - a[1].clientX) || 1, cx: (a[0].clientX + a[1].clientX) / 2 };
      clearScrub();
    }
  };
  const onPointerMove = e => {
    if (e.pointerType !== 'touch') {
      if (e.buttons === 0) doScrub(e.clientX);
      else if (mode.current === 'pan') { panByPx(e.clientX - panX.current); panX.current = e.clientX; }
      return;
    }
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, e);
    if (mode.current === 'scrub' && pointers.current.size === 1) {
      doScrub(e.clientX);
    } else if (mode.current === 'pinch' && pointers.current.size >= 2) {
      const a = [...pointers.current.values()];
      const d = Math.abs(a[0].clientX - a[1].clientX) || 1;
      const cx = (a[0].clientX + a[1].clientX) / 2;
      zoomAround(cx, pinch.current.dist / d);
      panByPx(cx - pinch.current.cx);
      pinch.current = { dist: d, cx };
    }
  };
  const onPointerUp = e => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      mode.current = null;
      if (e.pointerType === 'touch') clearScrub();
    } else if (pointers.current.size === 1) {
      mode.current = 'scrub';
      pinch.current.cx = [...pointers.current.values()][0].clientX;
    }
  };
  const onPointerLeave = e => { if (e.pointerType !== 'touch') clearScrub(); };
  const resetView = () => { setView({ s: 0, e: n - 1 }); setScrub(null); setActiveRange('all'); };

  const applyRange = r => {
    setScrub(null);
    setActiveRange(r);
    if (r === 'all') setView({ s: 0, e: n - 1 });
    else if (r === 'group') setView({ s: 0, e: koIndex > 0 ? koIndex : n - 1 });
    else if (r === 'ko') setView({ s: koIndex > 0 ? koIndex - 1 : 0, e: n - 1 });
    else if (r === 'last10') setView({ s: Math.max(0, n - 1 - 10), e: n - 1 });
  };

  if (!canRender) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📈</span>
        <p>{players.length ? 'No matches settled yet.' : 'Add players to see the standings race.'}</p>
        {players.length > 0 && (
          <span className={styles.emptySub}>The race chart draws itself as results come in.</span>
        )}
      </div>
    );
  }

  // ── derived geometry for the current window ──
  const vs = Math.max(0, Math.min(view.s, n - 1));
  const ve = Math.max(vs + 0.0001, Math.min(view.e, n - 1));
  const span = ve - vs;
  const xPix = i => PAD.l + ((i - vs) / span) * PLOT_W;

  const loI = Math.max(0, Math.floor(vs));
  const hiI = Math.min(n - 1, Math.ceil(ve));
  let dMin = Infinity, dMax = -Infinity;
  for (let i = loI; i <= hiI; i++) {
    for (const p of players) {
      const v = steps[i].totals[p.id];
      if (v < dMin) dMin = v;
      if (v > dMax) dMax = v;
    }
  }
  if (!isFinite(dMin)) { dMin = 0; dMax = 1; }
  if (dMin === dMax) { dMin -= 5; dMax += 5; }
  const dPad = Math.max((dMax - dMin) * 0.12, 2);
  let yLo = dMin - dPad;
  let yHi = dMax + dPad;
  if (yLo < 0 && dMin >= 0) yLo = 0;
  const yStep = niceStep((yHi - yLo) / 4);
  yLo = Math.floor(yLo / yStep) * yStep;
  yHi = Math.ceil(yHi / yStep) * yStep;
  if (yHi <= yLo) yHi = yLo + yStep;
  const yPix = total => PAD.t + (1 - (total - yLo) / (yHi - yLo)) * PLOT_H;

  const finalStep = steps[n - 1];
  const finalOrder = [...players].sort(
    (a, b) => (finalStep.totals[b.id] - finalStep.totals[a.id]) || a.name.localeCompare(b.name)
  );
  const leaderId = finalOrder[0]?.id;
  const isZoomed = vs > 0.01 || ve < n - 1 - 0.01;


  const i0 = Math.floor(ve), i1 = Math.min(n - 1, Math.ceil(ve));
  const tf = ve - i0;
  const LABEL_GAP = 12;
  const rightLabels = players
    .map(p => {
      const val = steps[i0].totals[p.id] * (1 - tf) + steps[i1].totals[p.id] * tf;
      return { id: p.id, name: p.name, color: p.color, isLead: p.id === leaderId, dotY: yPix(val), labelY: 0 };
    })
    .sort((a, b) => a.dotY - b.dotY);
  rightLabels.forEach((l, i) => {
    l.labelY = i === 0 ? l.dotY : Math.max(l.dotY, rightLabels[i - 1].labelY + LABEL_GAP);
  });
  const overflow = rightLabels.length ? rightLabels[rightLabels.length - 1].labelY - (H - PAD.b) : 0;
  if (overflow > 0) rightLabels.forEach(l => { l.labelY -= overflow; });

  const yTicks = [];
  for (let v = yLo; v <= yHi + 1e-6; v += yStep) {
    yTicks.push({ y: yPix(v), label: Math.round(v) });
  }

  // x date ticks within the visible window
  const xTicks = [];
  const lo = Math.ceil(vs), hi = Math.floor(ve);
  const tCount = Math.min(5, Math.max(1, hi - lo));
  const seen = new Set();
  for (let k = 0; k <= tCount; k++) {
    const i = Math.round(lo + (k * (hi - lo)) / tCount);
    const step = steps[i];
    if (!step?.kickoff) continue;
    const label = formatKickoff(step.kickoff).date;
    if (seen.has(label)) continue;
    seen.add(label);
    xTicks.push({ x: xPix(i), label });
  }

  // legend + readout reflect the scrubbed step (or latest)
  const at = scrubIdx ?? n - 1;
  const legendOrder = [...players].sort(
    (a, b) => (steps[at].totals[b.id] - steps[at].totals[a.id]) || a.name.localeCompare(b.name)
  );

  const ranges = [{ id: 'all', label: 'All' }];
  if (koIndex > 0) ranges.push({ id: 'group', label: 'Group' }, { id: 'ko', label: 'Knockout' });
  if (n - 1 > 12) ranges.push({ id: 'last10', label: 'Last 10' });

  const scrubStep = scrubIdx !== null ? steps[scrubIdx] : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.title}>📈 Standings race</span>
          <div className={styles.readout}>
            {scrubStep ? (
              <>
                <span className={styles.roDate}>{formatKickoff(scrubStep.kickoff).date || 'Start'}</span>
                <span className={styles.roMatch}>{scrubStep.match?.id ?? ''}</span>
              </>
            ) : (
              <span className={styles.roLatest}>Latest · {formatKickoff(finalStep.kickoff).date}</span>
            )}
          </div>
        </div>
        {ranges.length > 1 && (
          <div className={styles.ranges}>
            {ranges.map(r => (
              <button
                key={r.id}
                className={activeRange === r.id ? styles.rangeOn : ''}
                onClick={() => applyRange(r.id)}
              >{r.label}</button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.card}>
        {isZoomed && <span className={styles.zoomBadge}>⤢ zoomed · double-click to reset</span>}
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
          onDoubleClick={resetView}
        >
          <defs>
            <clipPath id="raceClip">
              <rect x={PAD.l} y={PAD.t - 6} width={PLOT_W} height={PLOT_H + 12} />
            </clipPath>
          </defs>

          {yTicks.map((t, i) => (
            <g key={`y${i}`}>
              <line className={styles.grid} x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y} />
              <text className={styles.axisTxt} x={PAD.l - 6} y={t.y + 3} textAnchor="end">{t.label}</text>
            </g>
          ))}

          {koIndex > vs && koIndex < ve && (
            <g>
              <line className={styles.divider} x1={xPix(koIndex)} y1={PAD.t} x2={xPix(koIndex)} y2={H - PAD.b} />
              <text className={styles.divLabel} x={xPix(koIndex) + 4} y={PAD.t + 10}>Knockout ▸</text>
            </g>
          )}

          {xTicks.map((t, i) => (
            <text key={`x${i}`} className={styles.axisTxt} x={t.x} y={H - 9} textAnchor="middle">{t.label}</text>
          ))}

          <g clipPath="url(#raceClip)">
            {finalOrder.slice().reverse().map(p => {
              const isLead = p.id === leaderId;
              const pts = steps.map((s, i) => `${xPix(i).toFixed(1)},${yPix(s.totals[p.id]).toFixed(1)}`).join(' ');
              return (
                <polyline
                  key={p.id}
                  className={`${styles.pline} ${isLead ? styles.leader : ''}`}
                  points={pts}
                  stroke={p.color || 'var(--text-dim)'}
                  opacity={isLead ? 1 : 0.82}
                />
              );
            })}
          </g>

          {rightLabels.map(l => (
            <g key={`end-${l.id}`}>
              <circle className={styles.endDot} cx={W - PAD.r} cy={l.dotY} r={l.isLead ? 4.5 : 3.5} fill={l.color || 'var(--text-dim)'} />
              {Math.abs(l.labelY - l.dotY) > 1 && (
                <line className={styles.labelStem} x1={W - PAD.r} y1={l.dotY} x2={W - PAD.r + 6} y2={l.labelY} stroke={l.color || 'var(--text-dim)'} />
              )}
              <text className={styles.endLabel} x={W - PAD.r + 8} y={l.labelY + 3} style={{ fill: l.color || 'var(--text-muted)' }}>{l.name}</text>
            </g>
          ))}

          {scrubIdx !== null && scrubIdx >= vs - 0.001 && scrubIdx <= ve + 0.001 && (
            <g>
              <line className={styles.scrubLine} x1={xPix(scrubIdx)} y1={PAD.t} x2={xPix(scrubIdx)} y2={H - PAD.b} />
              {players.map(p => (
                <circle
                  key={`sc-${p.id}`}
                  className={styles.scrubDot}
                  cx={xPix(scrubIdx)}
                  cy={yPix(steps[scrubIdx].totals[p.id])}
                  r={3.5}
                  fill={p.color || 'var(--text-dim)'}
                />
              ))}
            </g>
          )}
        </svg>

        <div className={styles.legend}>
          {legendOrder.map((p, idx) => (
            <span key={p.id} className={`${styles.lg} ${idx === 0 ? styles.lgFirst : ''}`}>
              <span className={styles.sw} style={{ background: p.color }} />
              <span className={styles.nm}>{p.name}</span>
              <span className={styles.tot}>{steps[at].totals[p.id]}</span>
            </span>
          ))}
        </div>
      </div>

      <p className={styles.hint}>
        <b>Drag</b> to scrub · <b>scroll / pinch</b> to zoom · <b>drag</b> to pan when zoomed · <b>double-click</b> to reset
      </p>
    </div>
  );
}
