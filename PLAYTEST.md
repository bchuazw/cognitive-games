# Current verification

## Passed: 39 automated tests

- Complete all ten games through their UI event handlers.
- Verify all ten cards share one grid, with the five compact games after the originals.
- Verify compact games have no start overlay, countdown, forced timeout or speed bonus.
- Check versioned saves and restoration of unfinished puzzles.
- Exercise incorrect guesses, corrections, notes, undo, restarts, hints and keyboard focus.
- Validate 100 path boards, 100 crown boards and hint completions, and 60 uniquely solvable Sudoku boards.
- Validate 100 Duet seeds: unique solutions, at least seven blanks, balanced rows, columns and center.
- Validate 100 Oddly seeds: exactly one distinct shape multiset despite rotations.
- Validate 100 Sumthing seeds: correct forward/inverse arithmetic and distinct options.
- Check every Wordhop ladder differs by one letter at each link.
- Check every Thread set has three directional fragments and six distinct choices.
- Verify reduced-motion behavior and Echo playback interruption.
- Verify repeated effects cancel cleanly, navigation clears active effects, disabled controls do not create touch rings, haptics are rate limited and safe when unavailable, and Trail segments remain correct when rewinding.

## Design changes

Peel, Upbeat and Glow are replaced by Thread, Wordhop and Duet. Oddly now requires comparing rotated four-shape patterns. Sumthing uses two-step equations instead of single elementary sums. Compact games are self-paced and immediately playable, with sparse instructions beside the board.

Motion is restrained: small press responses, brief error nudges, short reveals, and preserved DOM controls for focus and stable interaction. New puzzle completions show the solved connection or word chain where applicable instead of full-screen confetti. Duet uses neutral ink/ivory symbols, clear selected tools, fixed-clue markers, a center outline, and local rule feedback.

The tactile pass adds contact rings, press depth, tile settling, correct-answer and score pulses, vibration-like error shakes, animated Trail segments, staggered word shuffles, and completion emblems. Supporting browsers/devices receive brief vibration feedback on meaningful actions, with rate limiting and reduced-motion protection. Desktop hover movement is restricted to fine-pointer devices. Effects do not delay input, and each tile cancels its previous effect before starting another.

## Verification limits

No rendered browser inspection or physical touchscreen test has been completed. A prior Windows Computer Use attempt stopped because the tool could not determine Chrome's URL confidently enough to enforce its policy. Browser input was stopped. DOM tests do not establish animation quality, layout correctness, touch comfort or subjective difficulty.

Before release, test at 320px, 375px and desktop widths, keyboard-only navigation, browser zoom and reduced motion. Have adult first-time players solve each game without help; observe first-move clarity, recovery from mistakes, challenge, completion time and desire to replay. Review Thread's compound-word vocabulary for regional ambiguity. Do not claim guaranteed completion within a minute: difficulty and familiarity vary by player.
