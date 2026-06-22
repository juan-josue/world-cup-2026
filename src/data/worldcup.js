// Kickoff times are stored as ISO 8601 with the US Eastern offset (EDT = UTC−04:00),
// the timezone used in WORLDCUP_2026_SCHEDULE.md. `date` is the display label only;
// `kickoff` is the source of truth for prediction locking (see isLocked).
export const GROUPS = {
  A: { teams: ['Mexico','South Africa','Korea Republic','Czechia'],
       matches: [
         { id:'A1', date:'Jun 11', kickoff:'2026-06-11T15:00:00-04:00', home:'Mexico', away:'South Africa' },
         { id:'A2', date:'Jun 11', kickoff:'2026-06-11T22:00:00-04:00', home:'Korea Republic', away:'Czechia' },
         { id:'A3', date:'Jun 18', kickoff:'2026-06-18T12:00:00-04:00', home:'Czechia', away:'South Africa' },
         { id:'A4', date:'Jun 18', kickoff:'2026-06-18T21:00:00-04:00', home:'Mexico', away:'Korea Republic' },
         { id:'A5', date:'Jun 24', kickoff:'2026-06-24T21:00:00-04:00', home:'Czechia', away:'Mexico' },
         { id:'A6', date:'Jun 24', kickoff:'2026-06-24T21:00:00-04:00', home:'South Africa', away:'Korea Republic' },
       ]},
  B: { teams: ['Canada','Bosnia and Herzegovina','Qatar','Switzerland'],
       matches: [
         { id:'B1', date:'Jun 12', kickoff:'2026-06-12T15:00:00-04:00', home:'Canada', away:'Bosnia and Herzegovina' },
         { id:'B2', date:'Jun 13', kickoff:'2026-06-13T15:00:00-04:00', home:'Qatar', away:'Switzerland' },
         { id:'B3', date:'Jun 18', kickoff:'2026-06-18T15:00:00-04:00', home:'Switzerland', away:'Bosnia and Herzegovina' },
         { id:'B4', date:'Jun 18', kickoff:'2026-06-18T18:00:00-04:00', home:'Canada', away:'Qatar' },
         { id:'B5', date:'Jun 24', kickoff:'2026-06-24T15:00:00-04:00', home:'Switzerland', away:'Canada' },
         { id:'B6', date:'Jun 24', kickoff:'2026-06-24T15:00:00-04:00', home:'Bosnia and Herzegovina', away:'Qatar' },
       ]},
  C: { teams: ['Brazil','Morocco','Haiti','Scotland'],
       matches: [
         { id:'C1', date:'Jun 13', kickoff:'2026-06-13T18:00:00-04:00', home:'Brazil', away:'Morocco' },
         { id:'C2', date:'Jun 13', kickoff:'2026-06-13T21:00:00-04:00', home:'Haiti', away:'Scotland' },
         { id:'C3', date:'Jun 19', kickoff:'2026-06-19T18:00:00-04:00', home:'Scotland', away:'Morocco' },
         { id:'C4', date:'Jun 19', kickoff:'2026-06-19T20:30:00-04:00', home:'Brazil', away:'Haiti' },
         { id:'C5', date:'Jun 24', kickoff:'2026-06-24T18:00:00-04:00', home:'Scotland', away:'Brazil' },
         { id:'C6', date:'Jun 24', kickoff:'2026-06-24T18:00:00-04:00', home:'Morocco', away:'Haiti' },
       ]},
  D: { teams: ['United States','Paraguay','Australia','Türkiye'],
       matches: [
         { id:'D1', date:'Jun 12', kickoff:'2026-06-12T21:00:00-04:00', home:'United States', away:'Paraguay' },
         { id:'D2', date:'Jun 13', kickoff:'2026-06-13T21:00:00-04:00', home:'Australia', away:'Türkiye' },
         { id:'D3', date:'Jun 19', kickoff:'2026-06-19T15:00:00-04:00', home:'United States', away:'Australia' },
         { id:'D4', date:'Jun 19', kickoff:'2026-06-20T00:00:00-04:00', home:'Türkiye', away:'Paraguay' },
         { id:'D5', date:'Jun 25', kickoff:'2026-06-25T22:00:00-04:00', home:'Türkiye', away:'United States' },
         { id:'D6', date:'Jun 25', kickoff:'2026-06-25T22:00:00-04:00', home:'Paraguay', away:'Australia' },
       ]},
  E: { teams: ['Germany','Curaçao','Ivory Coast','Ecuador'],
       matches: [
         { id:'E1', date:'Jun 14', kickoff:'2026-06-14T13:00:00-04:00', home:'Germany', away:'Curaçao' },
         { id:'E2', date:'Jun 14', kickoff:'2026-06-14T19:00:00-04:00', home:'Ivory Coast', away:'Ecuador' },
         { id:'E3', date:'Jun 20', kickoff:'2026-06-20T16:00:00-04:00', home:'Germany', away:'Ivory Coast' },
         { id:'E4', date:'Jun 20', kickoff:'2026-06-20T20:00:00-04:00', home:'Ecuador', away:'Curaçao' },
         { id:'E5', date:'Jun 25', kickoff:'2026-06-25T16:00:00-04:00', home:'Curaçao', away:'Ivory Coast' },
         { id:'E6', date:'Jun 25', kickoff:'2026-06-25T16:00:00-04:00', home:'Ecuador', away:'Germany' },
       ]},
  F: { teams: ['Netherlands','Japan','Sweden','Tunisia'],
       matches: [
         { id:'F1', date:'Jun 14', kickoff:'2026-06-14T16:00:00-04:00', home:'Netherlands', away:'Japan' },
         { id:'F2', date:'Jun 14', kickoff:'2026-06-14T22:00:00-04:00', home:'Sweden', away:'Tunisia' },
         { id:'F3', date:'Jun 20', kickoff:'2026-06-20T13:00:00-04:00', home:'Netherlands', away:'Sweden' },
         { id:'F4', date:'Jun 20', kickoff:'2026-06-21T00:00:00-04:00', home:'Tunisia', away:'Japan' },
         { id:'F5', date:'Jun 25', kickoff:'2026-06-25T19:00:00-04:00', home:'Japan', away:'Sweden' },
         { id:'F6', date:'Jun 25', kickoff:'2026-06-25T19:00:00-04:00', home:'Tunisia', away:'Netherlands' },
       ]},
  G: { teams: ['Belgium','Egypt','Iran','New Zealand'],
       matches: [
         { id:'G1', date:'Jun 15', kickoff:'2026-06-15T15:00:00-04:00', home:'Belgium', away:'Egypt' },
         { id:'G2', date:'Jun 15', kickoff:'2026-06-15T21:00:00-04:00', home:'Iran', away:'New Zealand' },
         { id:'G3', date:'Jun 21', kickoff:'2026-06-21T15:00:00-04:00', home:'Belgium', away:'Iran' },
         { id:'G4', date:'Jun 21', kickoff:'2026-06-21T21:00:00-04:00', home:'New Zealand', away:'Egypt' },
         { id:'G5', date:'Jun 26', kickoff:'2026-06-26T23:00:00-04:00', home:'Egypt', away:'Iran' },
         { id:'G6', date:'Jun 26', kickoff:'2026-06-26T23:00:00-04:00', home:'New Zealand', away:'Belgium' },
       ]},
  H: { teams: ['Spain','Cape Verde','Saudi Arabia','Uruguay'],
       matches: [
         { id:'H1', date:'Jun 15', kickoff:'2026-06-15T12:00:00-04:00', home:'Spain', away:'Cape Verde' },
         { id:'H2', date:'Jun 15', kickoff:'2026-06-15T18:00:00-04:00', home:'Saudi Arabia', away:'Uruguay' },
         { id:'H3', date:'Jun 21', kickoff:'2026-06-21T12:00:00-04:00', home:'Spain', away:'Saudi Arabia' },
         { id:'H4', date:'Jun 21', kickoff:'2026-06-21T18:00:00-04:00', home:'Uruguay', away:'Cape Verde' },
         { id:'H5', date:'Jun 26', kickoff:'2026-06-26T20:00:00-04:00', home:'Cape Verde', away:'Saudi Arabia' },
         { id:'H6', date:'Jun 26', kickoff:'2026-06-26T20:00:00-04:00', home:'Uruguay', away:'Spain' },
       ]},
  I: { teams: ['France','Senegal','Iraq','Norway'],
       matches: [
         { id:'I1', date:'Jun 16', kickoff:'2026-06-16T15:00:00-04:00', home:'France', away:'Senegal' },
         { id:'I2', date:'Jun 16', kickoff:'2026-06-16T18:00:00-04:00', home:'Iraq', away:'Norway' },
         { id:'I3', date:'Jun 22', kickoff:'2026-06-22T17:00:00-04:00', home:'France', away:'Iraq' },
         { id:'I4', date:'Jun 22', kickoff:'2026-06-22T20:00:00-04:00', home:'Norway', away:'Senegal' },
         { id:'I5', date:'Jun 26', kickoff:'2026-06-26T15:00:00-04:00', home:'Norway', away:'France' },
         { id:'I6', date:'Jun 26', kickoff:'2026-06-26T15:00:00-04:00', home:'Senegal', away:'Iraq' },
       ]},
  J: { teams: ['Argentina','Algeria','Austria','Jordan'],
       matches: [
         { id:'J1', date:'Jun 16', kickoff:'2026-06-16T21:00:00-04:00', home:'Argentina', away:'Algeria' },
         { id:'J2', date:'Jun 16', kickoff:'2026-06-17T00:00:00-04:00', home:'Austria', away:'Jordan' },
         { id:'J3', date:'Jun 22', kickoff:'2026-06-22T13:00:00-04:00', home:'Argentina', away:'Austria' },
         { id:'J4', date:'Jun 22', kickoff:'2026-06-22T23:00:00-04:00', home:'Jordan', away:'Algeria' },
         { id:'J5', date:'Jun 27', kickoff:'2026-06-27T22:00:00-04:00', home:'Jordan', away:'Argentina' },
         { id:'J6', date:'Jun 27', kickoff:'2026-06-27T22:00:00-04:00', home:'Algeria', away:'Austria' },
       ]},
  K: { teams: ['Portugal','DR Congo','Uzbekistan','Colombia'],
       matches: [
         { id:'K1', date:'Jun 17', kickoff:'2026-06-17T13:00:00-04:00', home:'Portugal', away:'DR Congo' },
         { id:'K2', date:'Jun 17', kickoff:'2026-06-17T22:00:00-04:00', home:'Uzbekistan', away:'Colombia' },
         { id:'K3', date:'Jun 23', kickoff:'2026-06-23T13:00:00-04:00', home:'Portugal', away:'Uzbekistan' },
         { id:'K4', date:'Jun 23', kickoff:'2026-06-23T22:00:00-04:00', home:'Colombia', away:'DR Congo' },
         { id:'K5', date:'Jun 27', kickoff:'2026-06-27T19:30:00-04:00', home:'Colombia', away:'Portugal' },
         { id:'K6', date:'Jun 27', kickoff:'2026-06-27T19:30:00-04:00', home:'DR Congo', away:'Uzbekistan' },
       ]},
  L: { teams: ['England','Croatia','Ghana','Panama'],
       matches: [
         { id:'L1', date:'Jun 17', kickoff:'2026-06-17T16:00:00-04:00', home:'England', away:'Croatia' },
         { id:'L2', date:'Jun 17', kickoff:'2026-06-17T19:00:00-04:00', home:'Ghana', away:'Panama' },
         { id:'L3', date:'Jun 23', kickoff:'2026-06-23T16:00:00-04:00', home:'England', away:'Ghana' },
         { id:'L4', date:'Jun 23', kickoff:'2026-06-23T19:00:00-04:00', home:'Panama', away:'Croatia' },
         { id:'L5', date:'Jun 27', kickoff:'2026-06-27T17:00:00-04:00', home:'Panama', away:'England' },
         { id:'L6', date:'Jun 27', kickoff:'2026-06-27T17:00:00-04:00', home:'Croatia', away:'Ghana' },
       ]},
};

export const ALL_MATCHES = Object.entries(GROUPS).flatMap(([group, g]) =>
  g.matches.map(m => ({ ...m, group }))
);

export const FLAGS = {
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'Korea Republic': '🇰🇷', 'Czechia': '🇨🇿',
  'Canada': '🇨🇦', 'Bosnia and Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷', 'Morocco': '🇲🇦', 'Haiti': '🇭🇹', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'United States': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Türkiye': '🇹🇷',
  'Germany': '🇩🇪', 'Curaçao': '🇨🇼', 'Ivory Coast': '🇨🇮', 'Ecuador': '🇪🇨',
  'Netherlands': '🇳🇱', 'Japan': '🇯🇵', 'Sweden': '🇸🇪', 'Tunisia': '🇹🇳',
  'Belgium': '🇧🇪', 'Egypt': '🇪🇬', 'Iran': '🇮🇷', 'New Zealand': '🇳🇿',
  'Spain': '🇪🇸', 'Cape Verde': '🇨🇻', 'Saudi Arabia': '🇸🇦', 'Uruguay': '🇺🇾',
  'France': '🇫🇷', 'Senegal': '🇸🇳', 'Iraq': '🇮🇶', 'Norway': '🇳🇴',
  'Argentina': '🇦🇷', 'Algeria': '🇩🇿', 'Austria': '🇦🇹', 'Jordan': '🇯🇴',
  'Portugal': '🇵🇹', 'DR Congo': '🇨🇩', 'Uzbekistan': '🇺🇿', 'Colombia': '🇨🇴',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croatia': '🇭🇷', 'Ghana': '🇬🇭', 'Panama': '🇵🇦',
};

// ---------------------------------------------------------------------------
// KNOCKOUT STAGE
// nextMatchId / nextSlot: where the winner feeds into the bracket
// homeDesc / awayDesc: placeholder shown until admin sets actual teams
// kickoff: ISO 8601 (ET, UTC−04:00) — drives the prediction lock
// ---------------------------------------------------------------------------
export const KNOCKOUT_ROUNDS = [
  {
    id: 'r32', name: 'Round of 32',
    matches: [
      { id:'R32_1',  date:'Jun 28', kickoff:'2026-06-28T15:00:00-04:00', homeDesc:'1A', awayDesc:'3D/E/F', nextMatchId:'R16_1', nextSlot:'home' },
      { id:'R32_2',  date:'Jun 29', kickoff:'2026-06-29T13:00:00-04:00', homeDesc:'1B', awayDesc:'3A/C/D', nextMatchId:'R16_1', nextSlot:'away' },
      { id:'R32_3',  date:'Jun 29', kickoff:'2026-06-29T16:30:00-04:00', homeDesc:'1C', awayDesc:'3A/B/E', nextMatchId:'R16_2', nextSlot:'home' },
      { id:'R32_4',  date:'Jun 29', kickoff:'2026-06-29T21:00:00-04:00', homeDesc:'1D', awayDesc:'2B',     nextMatchId:'R16_2', nextSlot:'away' },
      { id:'R32_5',  date:'Jun 30', kickoff:'2026-06-30T13:00:00-04:00', homeDesc:'1E', awayDesc:'2D',     nextMatchId:'R16_3', nextSlot:'home' },
      { id:'R32_6',  date:'Jun 30', kickoff:'2026-06-30T17:00:00-04:00', homeDesc:'1F', awayDesc:'2C',     nextMatchId:'R16_3', nextSlot:'away' },
      { id:'R32_7',  date:'Jun 30', kickoff:'2026-06-30T21:00:00-04:00', homeDesc:'1G', awayDesc:'2F',     nextMatchId:'R16_4', nextSlot:'home' },
      { id:'R32_8',  date:'Jul 1',  kickoff:'2026-07-01T12:00:00-04:00', homeDesc:'1H', awayDesc:'2E',     nextMatchId:'R16_4', nextSlot:'away' },
      { id:'R32_9',  date:'Jul 1',  kickoff:'2026-07-01T16:00:00-04:00', homeDesc:'1I', awayDesc:'2H',     nextMatchId:'R16_5', nextSlot:'home' },
      { id:'R32_10', date:'Jul 1',  kickoff:'2026-07-01T20:00:00-04:00', homeDesc:'1J', awayDesc:'2G',     nextMatchId:'R16_5', nextSlot:'away' },
      { id:'R32_11', date:'Jul 2',  kickoff:'2026-07-02T15:00:00-04:00', homeDesc:'1K', awayDesc:'2J',     nextMatchId:'R16_6', nextSlot:'home' },
      { id:'R32_12', date:'Jul 2',  kickoff:'2026-07-02T19:00:00-04:00', homeDesc:'1L', awayDesc:'2I',     nextMatchId:'R16_6', nextSlot:'away' },
      { id:'R32_13', date:'Jul 2',  kickoff:'2026-07-02T23:00:00-04:00', homeDesc:'2K', awayDesc:'3G/H/I', nextMatchId:'R16_7', nextSlot:'home' },
      { id:'R32_14', date:'Jul 3',  kickoff:'2026-07-03T14:00:00-04:00', homeDesc:'2L', awayDesc:'3J/K/L', nextMatchId:'R16_7', nextSlot:'away' },
      { id:'R32_15', date:'Jul 3',  kickoff:'2026-07-03T18:00:00-04:00', homeDesc:'3B/C/F', awayDesc:'2A', nextMatchId:'R16_8', nextSlot:'home' },
      { id:'R32_16', date:'Jul 3',  kickoff:'2026-07-03T21:30:00-04:00', homeDesc:'3B/D/G', awayDesc:'1L', nextMatchId:'R16_8', nextSlot:'away' },
    ],
  },
  {
    id: 'r16', name: 'Round of 16',
    matches: [
      { id:'R16_1', date:'Jul 4', kickoff:'2026-07-04T13:00:00-04:00', homeDesc:'W R32_1',  awayDesc:'W R32_2',  nextMatchId:'QF1', nextSlot:'home' },
      { id:'R16_2', date:'Jul 4', kickoff:'2026-07-04T17:00:00-04:00', homeDesc:'W R32_3',  awayDesc:'W R32_4',  nextMatchId:'QF1', nextSlot:'away' },
      { id:'R16_3', date:'Jul 5', kickoff:'2026-07-05T16:00:00-04:00', homeDesc:'W R32_5',  awayDesc:'W R32_6',  nextMatchId:'QF2', nextSlot:'home' },
      { id:'R16_4', date:'Jul 5', kickoff:'2026-07-05T20:00:00-04:00', homeDesc:'W R32_7',  awayDesc:'W R32_8',  nextMatchId:'QF2', nextSlot:'away' },
      { id:'R16_5', date:'Jul 6', kickoff:'2026-07-06T15:00:00-04:00', homeDesc:'W R32_9',  awayDesc:'W R32_10', nextMatchId:'QF3', nextSlot:'home' },
      { id:'R16_6', date:'Jul 6', kickoff:'2026-07-06T20:00:00-04:00', homeDesc:'W R32_11', awayDesc:'W R32_12', nextMatchId:'QF3', nextSlot:'away' },
      { id:'R16_7', date:'Jul 7', kickoff:'2026-07-07T12:00:00-04:00', homeDesc:'W R32_13', awayDesc:'W R32_14', nextMatchId:'QF4', nextSlot:'home' },
      { id:'R16_8', date:'Jul 7', kickoff:'2026-07-07T16:00:00-04:00', homeDesc:'W R32_15', awayDesc:'W R32_16', nextMatchId:'QF4', nextSlot:'away' },
    ],
  },
  {
    id: 'qf', name: 'Quarter-Finals',
    matches: [
      { id:'QF1', date:'Jul 9',  kickoff:'2026-07-09T16:00:00-04:00', homeDesc:'W R16_1', awayDesc:'W R16_2', nextMatchId:'SF1', nextSlot:'home' },
      { id:'QF2', date:'Jul 10', kickoff:'2026-07-10T15:00:00-04:00', homeDesc:'W R16_3', awayDesc:'W R16_4', nextMatchId:'SF1', nextSlot:'away' },
      { id:'QF3', date:'Jul 11', kickoff:'2026-07-11T17:00:00-04:00', homeDesc:'W R16_5', awayDesc:'W R16_6', nextMatchId:'SF2', nextSlot:'home' },
      { id:'QF4', date:'Jul 11', kickoff:'2026-07-11T21:00:00-04:00', homeDesc:'W R16_7', awayDesc:'W R16_8', nextMatchId:'SF2', nextSlot:'away' },
    ],
  },
  {
    id: 'sf', name: 'Semi-Finals',
    matches: [
      { id:'SF1', date:'Jul 14', kickoff:'2026-07-14T15:00:00-04:00', homeDesc:'W QF1', awayDesc:'W QF2', nextMatchId:'FINAL', nextSlot:'home' },
      { id:'SF2', date:'Jul 15', kickoff:'2026-07-15T15:00:00-04:00', homeDesc:'W QF3', awayDesc:'W QF4', nextMatchId:'FINAL', nextSlot:'away' },
    ],
  },
  {
    id: 'final', name: 'Final',
    matches: [
      { id:'3RD',   date:'Jul 18', kickoff:'2026-07-18T17:00:00-04:00', homeDesc:'L SF1', awayDesc:'L SF2' },
      { id:'FINAL', date:'Jul 19', kickoff:'2026-07-19T15:00:00-04:00', homeDesc:'W SF1', awayDesc:'W SF2' },
    ],
  },
];

export const ALL_KNOCKOUT_MATCHES = KNOCKOUT_ROUNDS.flatMap(r => r.matches.map(m => ({ ...m, round: r.id })));

// Lookup of every match (group + knockout) by id — used for lock checks.
export const MATCH_BY_ID = Object.fromEntries(
  [...ALL_MATCHES, ...ALL_KNOCKOUT_MATCHES].map(m => [m.id, m])
);

// Format a kickoff (ISO string, ms, or Date) in the VIEWER's local timezone.
export function formatKickoff(value) {
  if (value == null) return { date: '', time: '' };
  const d = new Date(value);
  if (isNaN(d)) return { date: '', time: '' };
  return {
    date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
}

// A real match runs 45' + ~15' halftime + 45' + stoppage, so wall-clock ≈ 105–120 min.
// Wall-clock minute boundaries used to translate elapsed real time → match clock.
const FIRST_HALF_MIN = 45;
const HALFTIME_MIN = 15;
const SECOND_HALF_END_MIN = FIRST_HALF_MIN + HALFTIME_MIN + 45; // 105
export const LIVE_WINDOW_MS = 125 * 60000; // treat a match as "live" up to ~2h after kickoff

/**
 * Broadcast-style match clock derived from wall-clock elapsed since kickoff,
 * accounting for the halftime break. Returns { label, phase, progress 0–100 }.
 *   0–45'  first half        → match minute = elapsed
 *   45–60' halftime          → "HT" (progress holds at the midpoint)
 *   60–105' second half      → match minute = elapsed − 15
 *   105'+  stoppage/over     → "90+'"
 */
export function liveClock(kickoff, now = Date.now()) {
  const ko = typeof kickoff === 'number' ? kickoff : Date.parse(kickoff);
  const elapsed = Math.floor((now - ko) / 60000);
  if (elapsed < 0) return { label: '', phase: 'pre', progress: 0 };
  if (elapsed < FIRST_HALF_MIN) return { label: `${elapsed}'`, phase: '1H', progress: (elapsed / FIRST_HALF_MIN) * 50 };
  if (elapsed < FIRST_HALF_MIN + HALFTIME_MIN) return { label: 'HT', phase: 'HT', progress: 50 };
  if (elapsed < SECOND_HALF_END_MIN) {
    return { label: `${elapsed - HALFTIME_MIN}'`, phase: '2H', progress: 50 + ((elapsed - 60) / 45) * 50 };
  }
  return { label: "90+'", phase: 'FT', progress: 100 };
}

// Grace window: predictions stay editable for this long AFTER kickoff, so a
// player who's mid-entry when the match starts still gets a moment to lock in.
export const LOCK_GRACE_MS = 15 * 60 * 1000;

// When a match's prediction finally locks (kickoff + grace), or null if no kickoff.
export function lockTime(matchId) {
  const m = MATCH_BY_ID[matchId];
  return m && m.kickoff ? Date.parse(m.kickoff) + LOCK_GRACE_MS : null;
}

/**
 * A match's prediction locks at kickoff + LOCK_GRACE_MS. Returns true once `now`
 * is at/past that lock time. Matches without a kickoff are treated as never-locked.
 */
export function isLocked(matchId, now = Date.now()) {
  const lt = lockTime(matchId);
  return lt !== null && now >= lt;
}

/**
 * The active player's matches that have kicked off but are still inside the grace
 * window (started, not yet locked) and which they haven't predicted — i.e. bets
 * they can still lock in right now. Knockout matches count only once teams are set.
 * Each entry carries `lockAt` so the UI can count down to it. Soonest-to-lock first.
 */
export function getGraceMatches({ predictions, activePlayer, knockoutTeams = {}, now = Date.now() }) {
  if (!activePlayer) return [];
  const playerPreds = predictions?.[activePlayer] || {};
  const out = [];

  const consider = (m, home, away, tab, group) => {
    if (!m.kickoff) return;
    const ko = Date.parse(m.kickoff);
    const lockAt = ko + LOCK_GRACE_MS;
    if (now < ko || now >= lockAt || playerPreds[m.id]) return; // not in grace, or already locked in
    out.push({ id: m.id, home, away, lockAt, tab, group });
  };

  for (const m of ALL_MATCHES) consider(m, m.home, m.away, 'MATCHES', m.group);
  for (const m of ALL_KNOCKOUT_MATCHES) {
    const t = knockoutTeams[m.id];
    if (!t) continue;
    consider(m, t.home, t.away, 'KNOCKOUT', null);
  }
  return out.sort((a, b) => a.lockAt - b.lockAt);
}

function isSameLocalDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/**
 * Open matches the active player still hasn't predicted (kickoff in the future,
 * no prediction yet). Knockout matches only count once the admin has assigned
 * both teams — you can't predict a TBD slot.
 * Returns { total, todayCount, firstMatchId, firstTab, firstGroup }.
 */
export function getMissingPredictions({ predictions, activePlayer, knockoutTeams = {}, now = Date.now() }) {
  const empty = { total: 0, todayCount: 0, firstMatchId: null, firstTab: null, firstGroup: null };
  if (!activePlayer) return empty;

  const playerPreds = predictions?.[activePlayer] || {};
  const nowDate = new Date(now);
  const candidates = [];

  for (const m of ALL_MATCHES) {
    if (!m.kickoff) continue;
    const ts = Date.parse(m.kickoff);
    if (ts + LOCK_GRACE_MS <= now || playerPreds[m.id]) continue;
    candidates.push({ id: m.id, ts, tab: 'MATCHES', group: m.group });
  }
  for (const m of ALL_KNOCKOUT_MATCHES) {
    if (!m.kickoff) continue;
    const ts = Date.parse(m.kickoff);
    if (ts + LOCK_GRACE_MS <= now || playerPreds[m.id] || !knockoutTeams[m.id]) continue;
    candidates.push({ id: m.id, ts, tab: 'KNOCKOUT', group: null });
  }

  candidates.sort((a, b) => a.ts - b.ts);
  const todayCount = candidates.filter(c => isSameLocalDay(new Date(c.ts), nowDate)).length;
  const first = candidates[0] || null;
  return {
    total: candidates.length,
    todayCount,
    firstMatchId: first?.id ?? null,
    firstTab: first?.tab ?? null,
    firstGroup: first?.group ?? null,
  };
}

export const PLAYER_COLORS = [
  '#c9a84c', '#3d82d9', '#d94f3d', '#4db87a', '#b44dd9', '#d9884d',
];

/**
 * SCORING RULES:
 * - Correct winner (or draw): 1 pt
 * - Correct home score: 1 pt
 * - Correct away score: 1 pt
 * - Correct winner + EXACT score (both): multiply total by 2
 * Max per match: (1+1+1) × 2 = 6 pts
 */
export function scoreForMatch(pred, actual) {
  if (!pred || !actual) return 0;
  const ph = Number(pred.homeScore), pa = Number(pred.awayScore);
  const ah = Number(actual.homeScore), aa = Number(actual.awayScore);
  if (isNaN(ph) || isNaN(pa) || isNaN(ah) || isNaN(aa)) return 0;

  const predWinner = ph > pa ? 'home' : pa > ph ? 'away' : 'draw';
  const actualWinner = ah > aa ? 'home' : aa > ah ? 'away' : 'draw';

  const correctWinner = predWinner === actualWinner;
  const correctHome = ph === ah;
  const correctAway = pa === aa;
  const exactScore = correctHome && correctAway;

  let pts = 0;
  if (correctWinner) pts += 1;
  if (correctHome) pts += 1;
  if (correctAway) pts += 1;
  if (correctWinner && exactScore) pts *= 2;
  return pts;
}

export function computeLeaderboard(players, predictions, results) {
  return players.map(player => {
    let total = 0;
    const breakdown = {};
    Object.keys(results).forEach(matchId => {
      const pred = predictions?.[player.id]?.[matchId];
      const actual = results[matchId];
      const pts = scoreForMatch(pred, actual);
      breakdown[matchId] = pts;
      total += pts;
    });
    return { ...player, total, breakdown };
  }).sort((a, b) => b.total - a.total);
}
