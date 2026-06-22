# CONTEXT.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

**WC26 BETS** (`worldcup26-bets`) — a single-page web app for running a friends/office **prediction pool** for the FIFA World Cup 2026. Players predict scorelines for every group-stage and knockout match; an admin enters real results; the app auto-scores predictions and ranks players on a live leaderboard. All state is shared in real time across browsers via a single Firestore document.

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint (flat config, eslint.config.js)
```

There is **no test suite** and no test runner configured — do not assume one exists.

**Deploy:** Firebase Hosting (project `wc-bets-e51e1`). Build first, then `firebase deploy`. `firebase.json` serves `dist/` with a SPA rewrite (`**` → `/index.html`).

**Env:** Firebase config comes from `.env` via Vite `VITE_FIREBASE_*` vars (read in `src/firebase.js`). The file must exist for the app to connect to Firestore; missing vars produce a broken/empty client.

## Architecture (the big picture)

The whole app is **one Firestore document** + **one custom hook** + **a pure scoring module**. Understanding these three things explains nearly everything.

### 1. Single-document shared state — `src/hooks/useStore.js`

All shared data lives in **one Firestore doc: `wc26/data`**, shaped as:

```
{ players: [{id, name, color}],
  predictions: { [playerId]: { [matchId]: {homeScore, awayScore} } },
  results:     { [matchId]: {homeScore, awayScore} },
  knockoutTeams: { [matchId]: {home, away} } }   // admin-assigned bracket teams
```

- `useStore()` subscribes once via `onSnapshot` and exposes the data + mutators. **This is the single source of truth — every component receives data as props drilled down from `App.jsx`; there is no other store or context.**
- Writes use `setDoc(..., {merge:true})` (helper `patch()`), except `clearPrediction` which uses `updateDoc` + `deleteField()` for a precise nested delete, and `resetAll` which does a full overwrite.
- **`activePlayer` is the one piece of local-only state** — it's per-browser, stored in `localStorage` (`wc26_activePlayer`), NOT in Firestore. It identifies "who is predicting on this device." Everything else is global and shared.
- Because state is one shared doc, **there is no auth and no per-user isolation** — any browser can switch to any player, and the "ADMIN" toggle is purely client-side UI (`isAdmin` in `App.jsx`), not a security boundary.

### 2. Tournament data + scoring — `src/data/worldcup.js`

Static, hardcoded tournament definition and all scoring logic. No backend computes scores — it's all client-side and pure.

- `GROUPS` (A–L), `ALL_MATCHES`, `FLAGS` (emoji), `KNOCKOUT_ROUNDS` / `ALL_KNOCKOUT_MATCHES`, `PLAYER_COLORS`.
- **Match IDs are the join key everywhere**: group matches `A1`–`L6`; knockout `R32_1..16`, `R16_1..8`, `QF1..4`, `SF1..2`, `3RD`, `FINAL`. Predictions and results are keyed by these IDs.
- **Knockout bracket wiring**: each knockout match has `nextMatchId`/`nextSlot` (where the winner feeds forward) and `homeDesc`/`awayDesc` placeholders (e.g. `1A`, `W R32_1`) shown until an admin assigns real teams via `knockoutTeams`. Bracket layout in `KnockoutView.jsx` uses `ROUND_MULTIPLIERS` to size CSS cell heights so rounds align visually.
- **Scoring (`scoreForMatch`)** — per match: +1 correct winner/draw, +1 correct home score, +1 correct away score; if winner is correct **and** the exact score matches, the total is **doubled** (max 6/match). `computeLeaderboard` sums `scoreForMatch` over all matches that have a result, returns players sorted by total with a per-match `breakdown`. Change scoring rules **here only** — every view reads from these functions.

### 3. UI shell — `src/App.jsx`

- Three tabs: **MATCHES** (`GroupView` → `MatchCard`), **KNOCKOUT** (`KnockoutView` → `KnockoutMatchCard`), **LEADERBOARD** (`Leaderboard`).
- `Splash` gates entry (click-to-enter, also triggers `MusicPlayer` autoplay of `src/assets/theme.mp3`). `NextMatchBanner` shows a live countdown to the next unplayed match + a scrolling standings marquee.
- `PlayerManager` (sidebar) adds/removes/switches the active player. Admin mode reveals score-entry inputs in the match cards and a destructive "Reset all".

## Conventions

- **React 19 + Vite 8, plain JavaScript (`.jsx`), ESM** — no TypeScript. `framer-motion` for animation, `lucide-react` for icons.
- **CSS Modules** — every component pairs with a `*.module.css` file (`import styles from './X.module.css'`). Global styles in `src/index.css` / `src/App.css`.
- **Props-down, callbacks-up.** Components are presentational; all mutation flows back through `useStore` callbacks passed from `App.jsx`. Don't add Firestore calls inside components — extend `useStore` instead.
- Match cards take `isAdmin` to switch between prediction-entry and result-entry modes.

## Gotchas

- **No backend validation / no auth.** Anyone with the URL shares the same data and can act as admin or any player. Treat it as a trusted-friends tool.
- `.env` is git-ignored but required; without valid `VITE_FIREBASE_*` values the app loads but Firestore stays empty (perpetual or empty loading state).
- `resetAll` wipes players, predictions, results, and knockout teams globally for everyone — it's not local.
- Dates are strings like `'Jun 11'`; `NextMatchBanner` parses them against a hardcoded year **2026**.
