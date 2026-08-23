TASK: BUILD ROADMAP PHASE 3 — JAPANESE AIR DEFENSE (CANNON BATTLE)

IMPLEMENTATION STATUS (2026-08-22): COMPLETE

- Backend server-authoritative đã hỗ trợ solo `PRACTICE`/`SURVIVAL`/`SCORE_CHALLENGE` và multiplayer 1v1 `SCORE_RACE`/`SURVIVAL`.
- REST: tạo/lấy state/pause/resume tại `/api/air-defense/sessions`; STOMP command tại `/app/air-defense/{sessionId}/answer|state`, event riêng tại `/user/queue/air-defense`.
- Câu hỏi dùng lại `game_vocabulary`; đáp án dùng chung `JapaneseAnswerValidationService`, không truyền đáp án chuẩn hoặc câu hỏi đối thủ khi trận đang chạy.
- Gameplay board là React/Vite/TypeScript/Zustand + PixiJS; Japanese IME, HUD, reconnect, pause, result, replay solo và tái đấu qua phòng cũ đã được nối đầy đủ.
- MySQL dùng migration `V20260822_04__create_air_defense.sql`; solo luôn unranked, multiplayer 1v1 ranked và cùng cập nhật match record.
- Đã manual QA: solo impact/game-over/pause/resume/persistence/personal-best, `SCORE_CHALLENGE` success và `TIME_UP`; STOMP đáp án Katakana và duplicate command; 1v1 winner + không rò câu hỏi đối thủ + room reset; React và Maven build thành công với test bị bỏ qua theo quy ước dự án.
- Giới hạn có chủ đích: registry/scheduler còn single-instance; Phase 3 chỉ có aircraft `NORMAL`; âm thanh là WebAudio procedural; rating/ELO, Redis scale-out và asset âm thanh/spritesheet hoàn chỉnh thuộc phase sau.

Roadmap Phase 1 multiplayer room infrastructure already exists.

Do NOT rebuild the multiplayer foundation.

Follow `PHASE/README.md`. Keep the Spring Boot server authoritative, reuse authenticated STOMP messaging, and build the battlefield with React + TypeScript + PixiJS. Phaser is not allowed.

Implement the first complete realtime game:

AIR DEFENSE / CANNON BATTLE

Initial version:
solo and 1 versus 1.

Concept:

Each participant controls a cannon.

Enemy aircraft approach the player's defensive line.

Each aircraft carries a Japanese-learning question.

Example:

Displayed:
学校

Expected:
がっこう

The player types the correct answer.

Correct answer:
→ cannon loads/fires
→ projectile travels
→ aircraft is hit
→ explosion animation
→ score/combo is updated

If the aircraft reaches the defensive boundary before being destroyed:
→ player takes damage / loses life
→ explosion/impact feedback
→ continue or Game Over depending on mode.

==================================================
1. CORE ARCHITECTURE
==================================================

Use PixiJS + TypeScript for the actual battlefield, mounted inside a React component through a stable canvas/container ref.

Use React DOM components for:

- Japanese answer input
- HUD
- settings overlays
- pause/network state
- result screen

Do NOT create Japanese IME input inside the Pixi canvas.

HTML input should retain reliable Japanese IME behavior.

Create clear separation:

AirDefenseGame React route/component
PixiBattlefieldAdapter
AirDefenseRenderLoop
Aircraft
Projectile
Cannon
ExplosionEffect
GameHUD
AnswerInput
AirDefenseStompAdapter
AirDefenseViewStore

Use Zustand only as a client view/realtime store. Do not place authoritative scoring, answer validation, spawn decisions or victory rules in Zustand.

The Spring backend should isolate transport controllers from an `AirDefenseMatchService`/engine containing domain rules. Reuse the per-room concurrency and idempotency policy from Roadmap Phase 1.

Use architecture suitable for future assets and animations. Destroy Pixi tickers, listeners, textures owned by the component and subscriptions on unmount without destroying room-level voice or WebSocket services.

==================================================
1A. SOLO MODE
==================================================

Solo is a first-class practice/challenge mode, not a multiplayer room with a bot or fake opponent.

The authenticated player starts a server-owned solo session directly from the Arena. Matchmaking, invite, host migration and ready checks do not apply.

Reuse the same `AirDefenseMatchService`, aircraft scheduling, answer validation, Pixi renderer and result/statistics pipeline as multiplayer.

Solo supports:

- SURVIVAL: survive configured waves or as long as possible
- SCORE_CHALLENGE: reach a target score before the server-owned deadline
- PRACTICE: configurable difficulty with no competitive rating
- personal best for score, accuracy, combo and survival duration

Solo pause may be supported. Pause/resume is a server command that freezes/reschedules authoritative deadlines; browser visibility changes must not silently alter the simulation.

Do not award ELO/MMR or multiplayer win/loss records for solo results.

==================================================
2. SERVER AUTHORITATIVE STATE
==================================================

Server controls:

- current questions
- expected answers
- spawn decisions
- aircraft IDs
- aircraft deadlines
- player HP
- score
- combo
- correct/incorrect
- win/lose
- match state

Client controls only visualization and input.

Never expose the complete answer list for upcoming questions to the client.

For each active aircraft, only transmit necessary question data.

==================================================
3. AIRCRAFT MODEL
==================================================

Each active aircraft should have:

aircraftId
questionId
questionText
questionType
spawnAt
impactAt
difficulty
aircraftType
targetPlayer
state

Possible states:

SPAWNING
ACTIVE
HIT
DESTROYED
IMPACTED

Position does not need to be streamed every frame.

Instead send:

spawnAt
impactAt
route/type

Client interpolates aircraft position based on authoritative timestamps.

This dramatically reduces WebSocket traffic.

==================================================
4. QUESTION GENERATION
==================================================

Use existing vocabulary/Kanji database.

Do NOT invent a duplicate vocabulary table.

Support initial question modes:

KANJI_TO_HIRAGANA
KANJI_TO_MEANING

Design architecture so more modes can be added later.

Questions should respect room settings:

JLPT level
lesson/deck/source
difficulty

Avoid repeating the same term too frequently within one match.

Use server-side question selection.

==================================================
5. JAPANESE ANSWER NORMALIZATION
==================================================

Reuse the centralized backend `JapaneseAnswerValidationService` created in Roadmap Phase 1. Do not create a Cannon-specific validator.

Consider:

- trim whitespace
- Unicode NFKC normalization
- full-width/half-width forms
- Japanese punctuation
- optional kana normalization

For reading questions, make policy configurable.

Recommended default:
accept Katakana equivalent when answer is Hiragana by converting Katakana → Hiragana before comparison.

Example:

ガッコウ
→ がっこう

Do NOT make every typo automatically correct.

Competitive mode should resolve exact, approved-alias and conservative fuzzy matches deterministically. If semantic/OpenAI fallback is enabled, invoke it only through the backend shared pipeline with a strict deadline and an explicit `PENDING` or fail-closed policy. Never call AI from React, Pixi or the render ticker.

For meaning questions:
support approved answer aliases stored in DB/content validation system.

==================================================
6. ANSWER FLOW
==================================================

Client:

user submits answer

→ ANSWER_SUBMIT

Server validates:

- user belongs to match
- game active
- aircraft active
- answer deadline not passed
- question belongs to player
- answer not already resolved
- answer correctness

Server emits either:

ANSWER_CORRECT

or

ANSWER_INCORRECT

Correct payload should contain enough information to animate:

aircraftId
playerId
score
combo
projectile/event timing

Client then performs:

input success feedback
cannon recoil
muzzle flash
projectile
hit flash
explosion
score pop
combo animation

The explosion should visually occur only after server confirms correctness.

==================================================
7. GAME MODE A — SURVIVAL
==================================================

Configurable HP/lives.

Suggested default:
3 lives.

Aircraft reaches impact line:
server resolves AIRCRAFT_IMPACTED.

Player loses HP.

When HP reaches 0:

GAME_OVER

In multiplayer, the opponent wins. In solo, the run ends and the server records the achieved wave/score and learning statistics.

Prevent race condition where answer arrives at same moment as impact deadline.

Server timestamp must decide authoritative outcome.

==================================================
8. GAME MODE B — SCORE RACE
==================================================

Room settings or the solo-session settings choose target score.

Examples:

10
20
30
50

In multiplayer, the first player reaching the target number of correct answers wins.

In solo SCORE_CHALLENGE, reaching the target before the authoritative deadline completes the challenge; deadline expiry produces an incomplete/failed result according to the selected preset.

The server must atomically determine winner.

Do not allow both clients to independently declare victory.

==================================================
9. DIFFICULTY
==================================================

Difficulty should affect:

- aircraft travel time
- vocabulary level
- potentially question complexity

Do NOT make speed random without constraints.

Create difficulty presets.

Example conceptual values:

EASY:
long response window

NORMAL:
balanced

HARD:
shorter response window

Future aircraft types may include:

normal
fast
armored
boss

For Roadmap Phase 3, implement normal aircraft cleanly and make architecture extensible.

Optionally add fast aircraft only if core implementation is stable.

==================================================
10. VISUAL DESIGN
==================================================

Cannon Battle must look like a real game.

Background:
stylized Japanese night/sky visual.

Avoid overly detailed background that harms text readability.

Composition:

TOP:
player HUD

CENTER:
battlefield / aircraft

BOTTOM:
cannon + answer area

Possible HUD:

HUY
♥ ♥ ♥
Score 12
Combo ×4

            VS

MINH
♥ ♥
Score 10
Combo ×2

Question should be extremely readable.

Japanese typography is critical.

Use appropriate Japanese font already available or safe project font.

Question card should not look like a normal HTML form.

Create a floating target/question presentation attached visually to aircraft or target marker.

==================================================
11. INPUT EXPERIENCE
==================================================

Keep answer field automatically focused during gameplay.

Do not break Japanese IME composition.

Enter submits.

While IME composition is active:
Enter must not accidentally submit prematurely.

Handle compositionstart/compositionend events.

Correct:
short success glow.

Wrong:
subtle red feedback/shake.

Do not aggressively shake the entire screen for every typo.

Clear input according to intended gameplay behavior.

==================================================
12. ANIMATION
==================================================

Implement:

aircraft entrance
aircraft movement
cannon aim/recoil
muzzle flash
projectile trail
aircraft hit flash
explosion particles
score pop
combo pulse
damage effect
screen shake on major impact
game over transition
victory transition

Drive movement through the Pixi ticker using authoritative `spawnAt`/`impactAt` timestamps. Use Pixi spritesheets, lightweight tweens and particle containers/effects where suitable.

Avoid excessive DOM animation for battlefield objects.

==================================================
13. SOUND
==================================================

Prepare sound manager abstraction.

Sound categories:

BGM
SFX
UI

Controls:

mute
volume

Events:

cannon fire
hit
explosion
correct
incorrect
aircraft warning
damage
victory
defeat

If actual assets are unavailable:
create clean placeholders/hooks without adding copyrighted assets.

Do not load sounds from random external URLs.

==================================================
14. SYNCHRONIZATION
==================================================

Reuse the authenticated STOMP connection and typed command/event DTOs from Roadmap Phase 1. Do not open a game-specific Socket.IO or second WebSocket connection.

Do not stream positions every frame. Send spawn/impact timestamps and compact state deltas; clients interpolate visual positions. Include a monotonically increasing match version or sequence when event ordering matters.

Both players should be able to see:

- opponent HP
- opponent score
- opponent combo
- opponent hit/explosion feedback where appropriate

Do NOT reveal the opponent's current answer.

Question content should only be sent to the player who needs it unless game design requires otherwise.

==================================================
15. NETWORK RESILIENCE
==================================================

If temporarily disconnected:

show:

RECONNECTING...

Disable answer submission.

On reconnect:
request/resync complete current game snapshot.

Restore:

HP
score
active aircraft
deadlines
game timer
opponent state when multiplayer

Client should reconstruct aircraft positions using timestamps.

==================================================
16. GAME RESULT
==================================================

Create premium result screen.

Display:

Victory / Defeat for multiplayer, or Challenge Complete / Run Ended for solo
score
correct answers
wrong answers
accuracy
highest combo
average response time
match duration
rating placeholder/change for ranked multiplayer only
solo personal-best comparison when applicable

Actions:

REMATCH / PLAY AGAIN
BACK TO ROOM
RETURN TO ARENA

Multiplayer rematch should reuse room infrastructure without duplicate players. Solo Play Again creates a fresh server-owned solo session with copied allowed settings.

==================================================
17. DATABASE RESULT
==================================================

Persist final match data through Spring Data JPA using the existing match tables/migration conventions.

Persist `playMode`, solo preset/objective, ranked flag and completion outcome. Every solo record must set `ranked = false` and must not contain a fabricated opponent/winner.

Record useful learning statistics:

questionsAnswered
correctAnswers
incorrectAnswers
accuracy
averageResponseMs

Do not write to SQL for every animation/frame.

Batch/finalize stats appropriately.

==================================================
18. IMPORTANT EDGE CASES
==================================================

Manually verify:

solo PRACTICE
solo SURVIVAL
solo SCORE_CHALLENGE success and timeout
solo pause/resume if enabled
solo refresh/reconnect
answer arrives after deadline
duplicate Enter press
duplicate WebSocket message
player disconnects
player reconnects
client clock differs
two game-ending events happen simultaneously
question has multiple accepted readings
Katakana input for Hiragana answer
IME Enter behavior
room refresh
back navigation
match already finished
invalid aircraftId
answer for another player's aircraft

==================================================
19. COMPLETION CRITERIA
==================================================

One browser session must be able to start a solo game from the Arena, play through a complete run, reconnect, see an unranked result and start a new run without creating a fake opponent.

Two separate browser sessions must be able to:

enter one room
ready
start
receive questions
type Japanese answers
fire cannon
see aircraft explode
lose HP on impact
synchronize scores
finish match
see same authoritative winner

The game must feel visually polished and responsive.

The React/Vite frontend build and Maven backend build must pass. No Phaser dependency or Phaser-specific code may remain in the Game Arena bundle.

Run the builds, perform the manual scenarios above and fix problems introduced by the implementation.

Finally report:
- architecture
- networking events
- game state structure
- files changed
- DB changes
- manual verification performed
- known limitations
