# Air Defence — Design System & Screen Map

## Product intent
Air Defence is a real-time Japanese vocabulary typing arena. The interface should make the player feel like a calm-but-precise pilot: visual pressure rises in combat, while the surrounding meta-game is deliberately legible.

## Visual stance
**Tactical arcade instrument panel.** A near-black, blue-black space canvas holds compact flight-readout typography, cyan telemetry, amber threat states, and violet rarity/power moments. Panels use restrained translucent glass, fine cyan keylines, and thin scan-line textures—not soft SaaS cards.

### Type
- **Display / UI:** `Chakra Petch` — futuristic, squared letterforms for headings and primary actions.
- **Text:** `Noto Sans JP` — clear Japanese character rendering and readable body copy.
- **Telemetry:** `JetBrains Mono` — numerical status, timers, and ship system labels.

### Tokens
| Token | Value | Use |
| --- | --- | --- |
| Void | `#070A12` | app background |
| Cosmos | `#0D1730` | panel bases |
| Glass | `rgba(20, 36, 68, .66)` | primary HUD surfaces |
| Cyan | `#55F4FF` | active states / target locks |
| Violet | `#A979FF` | upgrades / rare details |
| Solar | `#FFC857` | economy / warnings |
| Alarm | `#FF4D6D` | danger / enemy state |
| Fog | `#9CB5D7` | secondary text |

## Screen map
1. **Command Deck** — daily mission, selected ship, mode entry points.
2. **Hangar** — ship gallery, stats, select/equip state.
3. **Talent Lab** — permanent progression tree and spend confirmation.
4. **Supply Dock** — ship shop plus coin balance.
5. **Match Queue** — mode selection / matchmaking readiness.
6. **Endless Flight** — primary typing combat HUD.
7. **PvP Flight** — player combat with opponent mini HUD and disruption status.
8. **Augment Draft** — pause state after every third wave, 3 cards and reroll count.
9. **Debrief** — victory/defeat, score economy, weak-word review.
10. **Rank Archive** — Endless and PvP leaderboards.

## Behaviour notes
- Every navigation choice is implemented in the prototype through the left rail and contextual CTAs.
- Combat input keeps Japanese IME composition intact: it only commits on Enter when `isComposing` is false.
- Actions use at least 48px hit targets on narrow screens. On mobile, the rail becomes a horizontal strip, complex game views stack, and the opposing PvP view becomes a mini-card.
