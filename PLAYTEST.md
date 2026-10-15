# Usability pass

## Verification method

Automated DOM interaction tests exercise actual application event handlers, plus independent puzzle generator tests. Browser automation reported no connected browsers or apps, so no hands-on browser session, rendered layout review, or real-device playtest was possible. Passing these tests does not establish that new players understand the games without assistance.

## Findings addressed

| Game / area | Friction | Change |
| --- | --- | --- |
| All boards | Core rules were hidden on phones | Short rule and visual cue above every board |
| All boards | Rebuilding the page on every move lost focus and prevented transitions | Reconcile existing elements; tested focus and element identity |
| Trail | Unclear starting point and silent invalid moves | Glowing start, valid-neighbor dots, specific feedback and dead-end guidance |
| Trail | Dragging could not rewind | Drag back one step, or tap any prior square |
| Crown | Three-state tapping was hard to discover | Tap to place/remove; explicit Mark tool |
| Crown | Mistakes only surfaced after checking | Immediate conflict outlines and plain-language reason |
| Crown | Correct placement required a separate check | Automatic completion |
| Crown | Hints could remove crowns from another valid solution | Find a completion consistent with existing crowns |
| Kinship | Guesses had little tactile feedback | Selection pop, gentle mismatch shake, matching-group reveal |
| Kinship | One category required specialist musical vocabulary | Replaced with everyday objects |
| Sixfold | Unclear number-entry sequence and duplicate cause | Disable pad until a writable square is selected; highlight peers and explain duplicates |
| Sixfold | Old notes lingered after number entry | Remove that number from related notes |
| Echo | Watching vs playing was easy to miss | Distinct colored status and clear round button |
| Echo | Playback continued behind help or in a hidden tab | Stop playback and allow replay |
| Motion | Mostly static; animations restarted unnecessarily | Stable controls, action-specific feedback, limited welcome motion and brief win confetti |

## Automated coverage

- Complete all five games through their controls.
- Reject invalid first moves; extend and rewind a path with pointer events.
- Crown placement, removal, marking, conflict explanations and automatic win.
- Wrong word guesses, editing selections, and preserving keyboard focus.
- Sudoku notes, undo, duplicate detection, erase and completion.
- Echo mistakes, retries, all rounds, and cancellation when help opens.
- Restart and hints; completion and unfinished progress restored after application reload.
- Reduced-motion skips JavaScript animation and confetti.
- Every game exposes inline instructions without opening a dialog.
- 100 path seeds, 100 crown region seeds, 100 crown hint completions, and 60 unique Sudoku puzzles.

## Manual checks still needed

1. Play each game in Chrome/Safari at desktop and 375px phone widths; check wrapping, scroll position, board sizing and animation timing.
2. Test real touchscreen drag gestures, diagonal drags, quick taps and interruptions.
3. Ask a first-time player to begin each game without opening help. Observe the first move, first error, and recovery; aim for understanding within 15 seconds.
4. Check keyboard-only use, browser zoom and device reduced-motion settings.
5. Confirm Echo feels comfortable across slower devices and that every repeated flash is distinguishable.


## Ten-game extension

33 automated tests pass after adding the five quick games. Coverage includes all ten cards in one grid in the requested order, all five quick-game completion paths, 45-second timeout and help pause for every quick game, fruit-card mismatch locking, Glow transition locking and partial-board restoration, and personal best/replay behavior. Generation checks exercise 100 seeds each for Glow, arithmetic, shapes and pairs. Every quick board displays its core rule above the board on all screen sizes.

A later Windows Computer Use attempt could launch Chrome, but state capture stopped because the tool could not confidently determine the current browser URL. No further browser input was attempted. Visual and real-device checks remain outstanding.
