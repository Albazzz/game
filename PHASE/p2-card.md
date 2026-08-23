TASK: BUILD ROADMAP PHASE 2B — JAPANESE CARD BATTLE (CARD DUEL)

Roadmap Phase 1 multiplayer foundation exists.

Do not rebuild it.

Memory Match may be developed in parallel, but Card Battle must remain a separate game module.

Follow `PHASE/README.md`. Keep match rules in the Spring Boot backend. Build the game UI with React DOM + TypeScript + Tailwind CSS + Framer Motion; do not implement Card Battle in PixiJS or another canvas engine.

Implement:

JAPANESE CARD DUEL

Supported players:
2–4.

Supported match configurations:

1v1
1v1v1
1v1v1v1
2v2
2v1 for a 3-player asymmetric room if room explicitly selects teams

Keep architecture extensible.

==================================================
1. GAME CONCEPT
==================================================

Before match, players select vocabulary cards from eligible learning content.

Example card:

学校

When played, opponent receives a challenge such as:

"Read this Kanji"

Expected:
がっこう

or:

"What does this mean?"

Expected:
school / trường học

depending on game mode.

Players answer within a time limit.

Correct answers give score / prevent attack / trigger card rules.

Wrong answers trigger penalties according to card type.

==================================================
2. CARD DATA MODEL
==================================================

Separate:

Vocabulary content

from

Gameplay card effects.

Do NOT store duplicate Japanese language content inside gameplay definitions unnecessarily.

Conceptual model:

GameCard:
cardId
contentId
cardType
rarity if used
effectType
effectValue
metadata

Content reference:
vocabularyId / kanjiId

Card content should be resolved through existing learning database.

==================================================
3. PRE-MATCH CARD SELECTION
==================================================

Implement Deck Preparation.

Suggested default:

10 vocabulary cards per player.

Room setting can later allow:
10 / 15 / 20.

Players select from allowed source:

JLPT level
lesson
saved vocabulary list
teacher deck
global vocabulary pool

UI should display attractive collectible-style cards.

Card front:
Kanji / vocabulary
category indicator
difficulty
small visual identity

Do NOT reveal unnecessary expected answers during opponent challenge.

==================================================
4. CONTENT VALIDATION
==================================================

Questions and accepted answers must already be validated BEFORE being used in a match.

Create content validation state if needed:

PENDING
VALIDATED
REJECTED
NEEDS_REVIEW

AI may assist content validation outside realtime gameplay.

AI can verify:

Kanji
reading
Vietnamese/English meaning
aliases
difficulty
question consistency

But during actual game:

NO AI API CALL.

Answer must be checked using prevalidated server data.

If current database already has trusted vocabulary, mark/use it without unnecessary AI calls.

==================================================
5. TURN ENGINE
==================================================

Build a reusable authoritative TurnManager.

Possible states:

MATCH_PREPARING
TURN_START
SELECT_CARD
TARGET_SELECTION
QUESTION_PRESENTED
ANSWERING
RESOLVING
EFFECT_APPLYING
TURN_END
MATCH_FINISHED

Server controls all transitions.

Each state has valid permitted actions.

Reject actions invalid for current state.

Example:

Player B cannot play a card during Player A's SELECT_CARD state.

==================================================
6. TURN TIMER
==================================================

Use server timestamps.

Example:

turnStartedAt
actionDeadline
answerDeadline

Do not trust local timers.

UI visualizes remaining time from server timestamp.

On timeout:
server automatically resolves appropriate result.

==================================================
7. BASIC CARD TYPES
==================================================

Implement a balanced first version.

NORMAL

No special modifier.

ATTACK

If defender answers incorrectly:
additional penalty/damage.

SHIELD

Reduces next valid damage/penalty.

TIME_ATTACK

Reduces opponent answer time.

DOUBLE_POINT

Successful result gives additional score according to rules.

HINT

Owner can reveal a limited hint with a cost or reduced reward.

RECOVERY

Restores HP/mistake allowance depending on selected game mode.

REVERSE

Redirects challenge according to valid target/rule.

TRAP

If triggered and opponent answers incorrectly:
extra penalty.

JOKER

Allows owner to replace/redraw a challenge/card under defined conditions.

Do not implement effects as arbitrary if/else spread through UI components.

Create a backend `CardEffectResolver` abstraction as a Spring service/domain component. Effects consume validated server state and return explicit state changes/events; UI components only render confirmed results.

The roadmap names the first signature effects as:

BOMB

Server-defined attack/area penalty. This maps to the controlled ATTACK family; the client cannot submit damage values.

MIRROR

Reflects or redirects a valid challenge/effect. This maps to the REVERSE family.

FOG

Temporarily limits public presentation according to a server-defined rule without exposing or changing hidden answer data.

TIME_WARP

Changes a server-owned deadline within configured bounds. This maps to the TIME_ATTACK family.

BUFF

A typed family for SHIELD, DOUBLE_POINT or RECOVERY effects. Every buff has a server-defined duration, stack rule and cap.

Keep canonical identifiers consistent across Java enums, persistence snapshots and TypeScript types. Older conceptual names may be retained as effect families, not as conflicting duplicate cards.

==================================================
8. CARD BALANCE RULES
==================================================

Special cards must be limited.

Example deck restriction:

10-card deck:
maximum 3 special cards.

No more than:
1 Joker
1 Recovery
etc.

Make limits configurable.

Do not allow players to create impossible/custom payloads to bypass deck restrictions.

Server validates deck before match.

==================================================
9. GAME MODE — SCORE
==================================================

Match duration or round count configurable.

Correct:
+1 base point.

Card effects may modify reward.

After timer/round limit:
highest score wins.

Tie:
use defined tiebreaker:

accuracy
then average response time
then sudden death if needed.

Server performs tiebreak.

==================================================
10. GAME MODE — MISTAKE/LIFE
==================================================

Each player/team starts with a configurable mistake allowance.

Example:

3 mistakes.

Wrong answer:
lose one.

At 0:
eliminated or match lost according to game mode.

Special cards can modify rules within controlled limits.

==================================================
11. TEAM MODE
==================================================

For 2v2:

Team A:
Player 1
Player 2

Team B:
Player 3
Player 4

Define turn order clearly.

Example:

A1 → B1 → A2 → B2

Or another deterministic sequence.

Team membership must be server authoritative.

For 2v1:
consider balancing settings.

Architecture must support teams without assuming every match is FFA.

==================================================
12. TARGET SELECTION
==================================================

FFA special/attack cards may require target selection.

Only allow valid targets.

Server determines target eligibility.

UI visually highlights selectable opponent cards/avatars.

==================================================
13. QUESTION TYPES
==================================================

Initial types:

KANJI_TO_HIRAGANA
KANJI_TO_MEANING

Optional if existing data supports reliably:

HIRAGANA_TO_MEANING
MEANING_TO_KANJI

Reuse the centralized backend `JapaneseAnswerValidationService` from Roadmap Phase 1. Card Battle and Air Defense must not have separate answer policies.

Do not duplicate answer validation logic.

==================================================
14. CARD DUEL UI
==================================================

This game needs a premium card-game presentation implemented in React DOM. Use Framer Motion for server-confirmed deal/play/flip/effect transitions and Tailwind/design tokens for layout and visual states.

Desktop concept:

                 OPPONENT

              avatar / score

          opponent card area


--------------------------------------

             ACTIVE CARD

              「学校」

           READ THIS KANJI


--------------------------------------

YOUR HAND

[Card][Card][Card][Card][Card]


BOTTOM:
answer / actions / turn timer

Cards should have:

depth
soft shadow
border treatment
rarity/effect indicator
hover elevation
selection glow
disabled state
play animation

Do not copy the appearance of copyrighted commercial card games.

Create an original visual identity inspired by modern Japanese fantasy/arcade UI.

==================================================
15. CARD ANIMATIONS
==================================================

Implement:

deck appear
deal
card hover
card selected
card play
card move to center
card flip
challenge reveal
correct response
incorrect response
effect activation
damage
shield
heal
discard
turn transition

Animations should represent server-confirmed actions.

==================================================
16. TURN INDICATOR
==================================================

Players must immediately know:

whose turn
what phase
how much time remains
what action is expected

Use:

animated turn border
avatar highlight
center status message
timer ring/bar

Do not rely only on text saying "Your Turn".

==================================================
17. RECONNECT
==================================================

On reconnect the Spring server sends a player-specific CardGame snapshot through an authorized private user destination:

turnNumber
currentPlayer
turnPhase
deadline
scores/HP
team
hand belonging to reconnecting player
public played/discarded state
active effects
remaining deck information allowed to client

Never send another player's hidden hand. Public room broadcasts and private player snapshots must use separate DTOs so a serialization mistake cannot leak hidden cards.

==================================================
18. ANTI-CHEAT
==================================================

Client must not receive:

opponent hidden cards
future deck ordering unless required
accepted answer values before challenge resolution

Validate card ownership server-side.

Reject:
playing card not in hand
playing card twice
invalid target
expired turn
modified effect values
fake score
fake answer result

==================================================
19. RESULT SCREEN
==================================================

Display:

winner/team
final score
accuracy
cards played
special effects activated
best streak
average response time

Allow:
rematch
back to room
arena

==================================================
20. MANUAL QA
==================================================

Manually verify:

1v1
3-player FFA
4-player FFA
2v2
2v1

Also:

timeout
disconnect current player
reconnect
special card combinations
double submissions
invalid target
Joker edge cases
Shield + Attack
Recovery at max
simultaneous final-score condition
team elimination
tie

==================================================
21. COMPLETION CRITERIA
==================================================

At least a complete 1v1 and 2v2 flow must function end-to-end.

2–4 player room state must remain synchronized.

Hidden information must not leak.

Card effects must be processed by server.

UI must visibly feel like a card game, not a quiz page with cards around it.

Run the builds, perform the manual scenarios above and report all implementation details.

The Maven backend build and React/Vite frontend build must pass. Document Java command/event DTOs, STOMP destinations, private/public snapshot schemas, persistence migrations and manual multi-browser verification. Do not add automated testcase files.
