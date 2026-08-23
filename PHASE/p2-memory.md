TASK: BUILD ROADMAP PHASE 2A — SOLO AND MULTIPLAYER JAPANESE MEMORY MATCH

Use the existing multiplayer foundation.

Implement a server-authoritative Memory Match game for one solo player or 2–4 multiplayer participants.

Follow `PHASE/README.md`. Deliver complete solo and realtime 1v1 flows first, then enable the same engine for 3–4 players. Keep rules, board generation and timers in Spring Boot; build the board with React DOM + TypeScript + Tailwind CSS Grid + Framer Motion. Do not use canvas for card text.

Stack split for this work package (per the hybrid decision in `PHASE/README.md`): the room/waiting screen stays the Phase 1 Thymeleaf page; only the Memory Match board is a React + Vite + TypeScript bundle, built into `src/main/resources/static/arena/app/memory/` and mounted by the Thymeleaf host page `GET /games/memory/{sessionId}`.

==================================================
1. CORE GAME
==================================================

Players see a board of face-down cards.

Example 30 cards:

15 Japanese content cards
+
15 corresponding answer cards

Example pair:

学校
↔
がっこう

Player flips first card.
Player flips second card.

If matched:
cards remain revealed
player scores
player keeps turn by default in multiplayer; solo player continues

If not matched:
cards remain visible briefly
then flip back
turn passes to the next player in multiplayer; the solo player continues.

Server determines match correctness.

==================================================
1A. SOLO MODE
==================================================

Solo is a first-class mode, not a multiplayer room containing a fake opponent.

The authenticated player starts a server-owned solo session directly from the Arena. Matchmaking, invite, host migration and ready checks do not apply.

Reuse the same board generator, secure hidden-card projection, flip validation and result/statistics pipeline used by multiplayer.

In solo mode:

- the same player continues after both a match and mismatch
- mismatched cards still hide after the server-coordinated reveal delay
- no NEXT_PLAYER event is emitted
- track pairs found, mistakes, moves, streak, elapsed time and average decision time
- support CLASSIC, TIME_ATTACK and optional MOVE_LIMIT objectives
- define success from clearing the board/objective, not from defeating an invented opponent

Pause may be supported only for solo. The server owns pause/resume state and adjusts deadlines authoritatively; hiding the browser tab must not silently pause the game.

==================================================
2. BOARD SIZE
==================================================

Support configurable sizes appropriate to grid layout.

Examples:

12
20
30
40

Ensure each total is even.

UI should adapt grid dimensions intelligently.

30 cards should not produce tiny unreadable Japanese characters.

On smaller screens allow scrolling/scale strategy while preserving readability.

==================================================
3. PAIR MODES
==================================================

Support:

KANJI ↔ HIRAGANA

KANJI ↔ MEANING

HIRAGANA ↔ MEANING

Architecture should later support:

KANJI ↔ AUDIO

KANJI ↔ EXAMPLE SENTENCE

Use existing vocabulary database.

==================================================
4. BOARD GENERATION
==================================================

The Spring backend chooses vocabulary pairs from the existing vocabulary repositories/services.

Server generates board arrangement.

Each card receives:

cardInstanceId
pairId internally
displayType
content
position
state

Never send pairId or hidden matching identifier to client if that would allow cheating.

Client receives only information necessary to render hidden/revealed cards.

==================================================
5. CARD STATES
==================================================

Server states:

HIDDEN
TEMP_REVEALED
MATCHED

Server controls allowed transitions.

Only current player may FLIP_CARD.

Cannot flip:

already matched card
same card twice
third card
card during resolve delay
card after timer
card during another player's turn

==================================================
6. MATCH FLOW
==================================================

Player selects first card.

Server:
validate
reveal

Broadcast CARD_REVEALED.

Player selects second.

Server:
validate
reveal
evaluate pair.

If match:

PAIR_MATCHED
score update
cards stay visible
player retains turn unless room setting says otherwise.

If mismatch:

PAIR_MISMATCH

Wait a short server-coordinated reveal period.

Suggested:
900–1400ms.

Then:

CARDS_HIDDEN
NEXT_TURN

Do not let client independently decide when mismatched cards hide.

==================================================
7. TIME LIMITS
==================================================

Support:

MATCH_TIMER
and/or
TURN_TIMER.

Room options:

overall time:
3 min
5 min
10 min

turn time:
10 sec
15 sec
20 sec

Server timestamps authoritative.

On turn timeout:

- MULTIPLAYER: advance to the next player
- SOLO: clear any temporary selection, apply the configured time/move penalty and continue with the same player

==================================================
8. WINNER
==================================================

Multiplayer standard:

when all pairs matched:
highest number of pairs wins.

Tie-breaking:

fewer mistakes
then faster average turn duration
then shared draw if still equal.

Allow future team mode.

Solo result:

- board cleared/objective completed: success
- timer or move limit exhausted first: incomplete/failed according to mode
- persist personal learning statistics, but never award competitive rating

==================================================
9. UI
==================================================

Memory Match should have a calm but competitive visual identity rendered with accessible React DOM elements.

Layout:

TOP:
player scoreboard

CENTER:
card grid

SIDE/BOTTOM:
turn information
timer
voice status later

Cards should resemble premium Japanese learning tiles.

Back side:
brand/game emblem
subtle Sakura pattern

Front side:
large Japanese text
or meaning text
category indicator

Do NOT overcrowd card faces.

==================================================
10. FLIP ANIMATION
==================================================

Create true card flip feeling with Framer Motion/CSS perspective while keeping the card content as DOM text:

perspective
rotateY
front/back faces
soft shadow
matched glow
match particle effect

Sequence:

click
→ card lifts slightly
→ flip
→ reveal

Match:
pair pulse
connection effect
score pop

Mismatch:
brief red/warm feedback
flip back smoothly

==================================================
11. TURN UI
==================================================

Current player:

strong but elegant highlight.

Others:
subtle inactive state.

When your turn begins:

short banner:
YOUR TURN

Player avatar border activates.

Timer starts visually.

==================================================
12. SYNCHRONIZATION
==================================================

Reuse the authenticated STOMP connection and typed event contract from Roadmap Phase 1. Do not create a second realtime transport.

All clients must see identical:

board positions
revealed cards
matched cards
current player
timer
score

Do not shuffle independently client-side.

==================================================
13. RECONNECT
==================================================

A reconnect snapshot is created by the Spring game service and includes:

board public state
current player
turn
score
deadline
matched cards
temporarily revealed cards

Reconnect UI reconstructs state without triggering flip animation incorrectly.

==================================================
14. SECURITY
==================================================

Do not expose hidden card content unnecessarily.

One possible secure pattern:

For HIDDEN cards:
client receives only cardInstanceId + position.

When server reveals:
server sends display content.

When card hides:
client removes display content from active client state.

Do not include all card answers inside initial DOM/JS where DevTools can reveal them.

==================================================
15. LEARNING RESULT
==================================================

At end show:

pairs found
accuracy
mistakes
terms encountered
terms player struggled with

Persist `playMode`, objective/preset, completion status, score/pairs, moves, mistakes and timing statistics. Mark every solo result as unranked so progression cannot mistake it for a competitive win.

Optionally allow:

Review These Words

This should link to existing learning/vocabulary system rather than duplicate learning functionality.

==================================================
16. MANUAL QA
==================================================

Manually verify:

solo CLASSIC
solo TIME_ATTACK
solo pause/resume if enabled
solo refresh/reconnect
2 players
3 players
4 players
12 cards
30 cards
mismatch
match
last pair
tie
timeout
disconnect
reconnect
rapid double click
same card twice
other player's click
hidden data inspection
browser refresh

==================================================
17. COMPLETION CRITERIA
==================================================

Solo can start from the Arena without matchmaking or a fake opponent.

All multiplayer clients see identical card board and turn.

No hidden answer leakage.

30-card board remains attractive/readable.

Animations are smooth.

Final results persist correctly.

Existing game infrastructure continues to work.

Solo and 1v1 are the first required milestones; the final work-package completion still requires synchronized 2–4 player support as specified above. Solo results must be marked unranked. Maven backend and React/Vite frontend builds must pass, and the completion report must document STOMP commands/events, snapshot DTOs, persistence migrations and manual hidden-data inspection. Do not add automated testcase files.
