# Little by Little

Ten browser games on one page. The original five: Trail (path planning), Crown (spatial logic), Kinship (word grouping), Sixfold (6 × 6 Sudoku), and Echo (sequence memory).

## Play locally

Requires Node.js 18 or newer to play. No runtime dependencies or build step. You can also double-click `Start Games.cmd`.

```powershell
git clone https://github.com/bchuazw/cognitive-games.git
cd cognitive-games
node server.mjs
```

To get the latest changes later, run `git pull` in the same folder.

Open **http://localhost:4173**. On a phone on the same Wi-Fi, use `http://YOUR-PC-LAN-IP:4173` if Windows Firewall allows the connection. The server listens on all interfaces for this purpose; use a trusted network.

Run generator validation with `node --test tests/engine.test.mjs`. For the full suite, use Node.js 22 or newer, run `npm.cmd install` to install the development-only DOM test dependency, then `npm.cmd test`. The automated tests cover generators and gameplay completion, hints, undo, restart, and saved daily progress. Visual browser and real-device testing remain to be done.

## Included

- Responsive desktop and phone layouts, touch targets, keyboard support, reduced-motion support, labeled game controls, and instructions.
- Deterministic daily puzzles based on the device's local date, free play after completion, restart, hints, undo where applicable, and a timer that pauses in background tabs.
- Browser-local automatic saves and completion statistics. No accounts, backend, analytics, or advertisements.
- Guaranteed solvable path and crown boards; Sixfold generation verifies exactly one solution. Crown can admit multiple valid arrangements, all accepted.
- Eight handcrafted Kinship sets. Sets can repeat; expanding this editorial library is the main content task before a long-running public release.
- Echo has five rounds, with sequences increasing from three to seven tiles. Playback is visual; a fully nonvisual memory mode is not included.

## Structure and mobile next steps

`engine.js` holds framework-independent puzzle generation and validation. `app.js` handles screens and gameplay; `ux.js` preserves live controls and provides feedback animations; `styles.css` holds responsive UI. `server.mjs` is a simple development server. Deploy the HTML, CSS, JS and icon files to a static host for a public browser version.

The interface is responsive for mobile browsers now. A future mobile release can reuse the engines in a native shell or a Capacitor wrapper, add offline asset caching, app icons, haptics, sound preferences, and optional cloud saves. There is no native app or installable PWA yet.

Typography loads from Google Fonts with local fallbacks. Game logic and assets otherwise require no external services. Progress is stored only on the current browser and does not sync between devices.

## Usability and motion pass

Each board includes a short inline rule on phones and desktops. Trail highlights possible next moves and supports drag-to-rewind. Crown uses separate Crown/Mark tools, explains conflicts immediately, and completes automatically; hints respect any arrangement that can still be solved. Sixfold highlights peers and duplicate entries. Echo distinguishes playback from input and stops playback when help opens or the tab is hidden. Controls remain in the DOM between moves to preserve focus and transitions. Motion includes tile feedback, gentle error shakes, group reveals, welcoming card entrances and brief completion confetti, with reduced-motion support.

See `PLAYTEST.md` for coverage and remaining manual checks.


## Five games under a minute

The next five cards appear directly after the original five in the same grid:

- **Oddly**: find the different shape across eight rounds.
- **Sumthing**: solve eight bite-size arithmetic questions.
- **Peel**: flip and match six pairs of fruit cards.
- **Upbeat**: tap shuffled numbers from 1 through 16.
- **Glow**: light all nine tiles by flipping a tile and its neighbors; three boards, each solvable in three taps.

Quick rounds last up to **45 seconds of active play**, finishing early when the target is reached. Start screens do not consume time. Background tabs and open help dialogs pause the clock. At timeout, the round ends with a partial score and a replay option. Each game keeps a personal best on this browser, and daily round completion contributes to the 10-game progress indicator. Scores award 800 points for full completion, up to 180 for finishing early, and subtract 15 per mistake (minimum zero). Glow measures efficiency through time rather than a move penalty.

`quick.js` contains the five engines and board markup. Tests cover generated content, full completion, timeout, pause behavior, mismatches, interrupted transitions and save/restore. Browser rendering remains unverified: Windows Computer Use stopped because it could not confidently determine Chrome's URL.
