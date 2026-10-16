# Little by Little

Ten browser puzzles.

## Run

Requires Node.js 18 or newer. No runtime dependencies or build step.

```powershell
git clone https://github.com/bchuazw/cognitive-games.git
cd cognitive-games
node server.mjs
```

To get the latest changes later, run `git pull` in the same folder.

Open http://localhost:4173, or double-click `Start Games.cmd`. The server binds to all interfaces so a phone on the same trusted Wi-Fi can use your computer's LAN IP if its firewall permits it.

## Games

| Game | Idea |
| --- | --- |
| Trail | Visit every square while connecting numbered checkpoints |
| Crown | Place non-touching crowns, one per row, column and region |
| Kinship | Find four families among sixteen words |
| Sixfold | Solve a uniquely generated 6 × 6 Sudoku |
| Echo | Repeat growing visual sequences |
| Oddly | Find the different multiset of shapes among rotated motifs; five patterns |
| Sumthing | Solve four two-step equations, alternating forward and inverse reasoning |
| Thread | Find one word that completes three compounds, with gaps on either side |
| Wordhop | Fill three clued gaps between endpoints, changing one letter each step |
| Duet | Balance two ink/two ivory tiles in each row, column and outlined center |


Daily seeds use the device's local date. Progress is saved in browser localStorage. Revised puzzles use versioned save keys so old timed sessions do not contaminate the new games; old records are preserved. Practice puzzles are available after completion. No accounts, ads, analytics or cloud sync.

## Development

`engine.js` generates the original puzzles. `short-puzzles.js` contains the compact puzzle engines, content and board markup; `quick.js` re-exports that API. `app.js` manages navigation, progress and input. `ux.js` updates existing controls and provides motion helpers. `styles.css` includes desktop and mobile layouts, focus states, touch feedback and reduced-motion support.

For all tests, use Node.js 22 or newer:

```powershell
npm.cmd install
npm.cmd test
```

There are 39 tests covering puzzle invariants, actual application event handlers, and feedback lifecycle. See `PLAYTEST.md` for limitations. Google Fonts has local font fallbacks; other assets are served locally.

Interaction feedback includes contact rings, tile press/settle responses, subtle error shakes, animated path segments and correct-answer pulses. Brief physical vibration is available only where supported by the browser and device. Reduced-motion settings disable nonessential animation and haptics. Rapid inputs cancel overlapping effects; changing games clears active effects.

## Inspiration and content

[LinkedIn's game descriptions](https://www.linkedin.com/help/linkedin/answer/a6863543) informed the use of compact association, word-ladder and balance puzzles. Thread mixes prefix/suffix placement, Wordhop uses a small selectable word bank, and Duet adds a center-balance constraint. These are independent implementations and original puzzle sets, not copies of LinkedIn daily puzzles or branding.

Word content is finite: 8 Kinship sets, 15 Thread sets and 8 Wordhop ladders. Expanding the editorial library and tuning difficulty through adult first-time-player testing are the next product tasks. The browser layout is mobile-responsive; native packaging, offline caching and cross-device saves are future work.
