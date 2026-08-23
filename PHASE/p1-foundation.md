TASK: BUILD ROADMAP PHASE 1 — MULTIPLAYER GAME FOUNDATION

Build the reusable multiplayer infrastructure for the Japanese learning game's Game Arena.

Follow `PHASE/README.md` as the architecture contract. Keep the existing Java 21/Spring Boot backend, Spring Security/JPA conventions and authenticated STOMP-over-SockJS endpoint. Do not create a NestJS or Socket.IO service.

Keep existing Thymeleaf learning pages operational. New Game Arena screens may be implemented as a React + Vite + TypeScript application mounted under `/games`, with Tailwind CSS for styling and Zustand for scoped realtime state.

Do NOT implement the actual Cannon/Card/Memory gameplay yet.

The objective of this phase is to build:

Game Arena
→ Lobby
→ Room
→ Invite/Join
→ Player synchronization
→ Ready system
→ Game configuration
→ Countdown
→ Start event
→ Solo game session entry for supported games
→ Disconnect/reconnect handling
→ End room lifecycle

==================================================
1. GAME ARENA ENTRY
==================================================

Create a dedicated Game Arena area in the application.

Suggested routes, adapting to the project's existing routing conventions:

/games
/games/lobby
/games/room/:roomId
/games/:gameType/solo

The /games page should display premium game cards for:

1. Cannon Battle
2. Card Duel
3. Memory Match

For now games that are not yet implemented may show:
"Coming Soon" or a development state.

The Arena page must visually feel separate from standard lesson pages but still belong to the same product.

Design a hero section with:
- Arena title
- current online/player information if available
- quick play button placeholder
- create room
- join room
- user's game profile summary placeholder

Game cards should support:
- hover animation
- game illustration/visual area
- title
- short description
- supported player count
- game type
- difficulty/tag
- multiplayer CTA
- Play Solo CTA for Cannon Battle/Air Defense and Memory Match

Do NOT use a generic grid with plain buttons.

==================================================
2. ROOM CREATION
==================================================

Implement Create Room.

Room properties should support:

roomId
roomCode
hostUserId
gameType
status
maxPlayers
players
createdAt
settings

Room statuses:

WAITING
COUNTDOWN
IN_GAME
FINISHED
CLOSED

Game types:

CANNON_BATTLE
CARD_DUEL
MEMORY_MATCH

Room visibility should be extensible for:

PUBLIC
PRIVATE

Private rooms should have an easy-to-share room code.

Generate a short human-friendly room code, while still using an internal secure unique room ID.

Prevent code collisions.

==================================================
3. ROOM SETTINGS
==================================================

Design GameSettings as a flexible structure.

Common settings should include:

playMode:
SOLO
MULTIPLAYER

questionLevel:
N5/N4/N3/N2/N1/custom if vocabulary supports it

questionSource:
user selected lesson
user vocabulary deck
global vocabulary
Kanji list
future custom deck

answerMode:
KANJI_TO_HIRAGANA
KANJI_TO_MEANING
HIRAGANA_TO_MEANING
MEANING_TO_KANJI
etc.

Specific game configuration must be extendable later.

Only the HOST can change multiplayer room settings. In solo mode, the authenticated session owner may change settings before the solo match starts.

Server validates host permission.

Broadcast settings changes to all connected users.

==================================================
4. PLAYER MODEL
==================================================

Realtime room player representation should contain only required safe information.

For example:

playerId
userId
displayName
avatar
ready
connected
team
slot
isHost

Never broadcast private user/account information.

Player states should be synchronized through the server.

==================================================
5. JOIN ROOM
==================================================

Allow user to:

- join through room ID
- join through room code
- leave room
- be removed if room closes
- reconnect if connection temporarily drops

Validate:

- authenticated user
- room exists
- room not closed
- room not full
- player not duplicated
- game state permits joining

Prevent one account from appearing twice in the same room due to multiple JOIN messages.

==================================================
6. READY SYSTEM
==================================================

Implement player Ready/Not Ready.

All non-host players must be ready.

Host should have:

START GAME

The button is disabled unless game requirements are satisfied.

Example:

Cannon Battle:
1 player in SOLO; exactly 2 players in MULTIPLAYER initially.

Card Duel:
2–4 players.

Memory:
1 player in SOLO; 2–4 players in MULTIPLAYER.

Do not hardcode this logic directly into UI.

Create reusable game rule metadata/configuration.

Game rule metadata must expose at least `supportedPlayModes`, `minPlayersByMode`, `maxPlayersByMode`, `rankedModes` and whether ready/countdown/room membership is required. The UI reads this metadata instead of inferring solo support from game names.

Solo start must not create a fake second player or wait for ready state. It creates an authenticated server-owned solo game session and starts through a dedicated command/service path. Reuse the same game engine used by multiplayer wherever rules overlap.

==================================================
7. COUNTDOWN
==================================================

After host starts:

Room status:
WAITING → COUNTDOWN

Server generates authoritative countdown.

Example:

3
2
1
START

Clients display animation based on server state/time.

Do not rely on independent setInterval values that can cause players to start at different times.

Transmit a server timestamp / startAt timestamp.

When countdown expires:

COUNTDOWN → IN_GAME

Emit GAME_START.

==================================================
8. SPRING WEBSOCKET/STOMP ARCHITECTURE
==================================================

Reuse the existing `/ws-arena` STOMP-over-SockJS endpoint, Spring Security identity, inbound channel interceptor and authorized destination conventions.

Do not add Socket.IO, a parallel Node.js realtime service or an unauthenticated fallback endpoint.

Define a consistent message/event envelope.

Example conceptual structure:

{
  type,
  roomId or soloSessionId/matchId,
  timestamp,
  payload
}

Do not trust playerId/userId supplied by client when it can be derived from authenticated session/JWT.

Candidate client → server actions:

ROOM_JOIN
ROOM_LEAVE
PLAYER_READY
PLAYER_UNREADY
ROOM_SETTINGS_UPDATE
GAME_START_REQUEST
SOLO_SESSION_CREATE

Candidate server → client events:

ROOM_STATE
PLAYER_JOINED
PLAYER_LEFT
PLAYER_UPDATED
ROOM_SETTINGS_UPDATED
COUNTDOWN_STARTED
GAME_STARTED
ROOM_ERROR
HOST_CHANGED
PLAYER_RECONNECTED
SOLO_SESSION_STARTED

Name events consistently with project style.

Map commands and events to explicit STOMP destinations. For example, commands may use `/app/arena/...`, private errors/snapshots may use `/user/queue/...`, and room events may use authorized `/topic/...` destinations. Exact paths must follow the existing project convention and be documented in the completion report.

Create Java command/event DTOs rather than accepting untyped maps. Keep equivalent TypeScript contracts in sync through schema generation or a documented payload contract; do not add contract-test suites for this project.

Do NOT over-broadcast complete database objects.

==================================================
9. SERVER AUTHORITATIVE GAME ROOM
==================================================

Create a GameRoomManager / RoomService abstraction.

Create a separate `SoloGameSessionService` entry/lifecycle abstraction for supported games. It may reuse shared match engines and persistence services, but it must not force solo through multiplayer membership, ready, host migration or matchmaking rules.

Responsibilities:

- create room
- find room
- add player
- remove player
- update ready state
- update settings
- validate permissions
- start countdown
- transition room status
- handle disconnect
- handle reconnect
- close expired rooms

Protect room state against concurrent modification.

Assume WebSocket messages from different players can arrive almost simultaneously.

Serialize mutations per room ID using appropriate Java concurrency primitives. Do not use one global lock for all rooms. Start, finish, ready and reconnect operations must be idempotent. If the application runs on multiple instances, JVM locks are insufficient; use explicit room ownership or Redis-backed coordination.

Do not place all logic inside WebSocket controllers.

Controller:
transport only

Service/Manager:
domain rules

==================================================
10. DISCONNECT AND RECONNECT
==================================================

Important.

WebSocket connection loss should not immediately remove a player from an active match.

Implement a reconnect grace period.

Suggested configurable default:
20–30 seconds.

On disconnect:

connected = false

Broadcast player's connection state.

If player reconnects before grace period:
restore connection.

If not:
apply room/game-specific disconnect policy.

During WAITING:
remove disconnected player after timeout.

During GAME:
future games will decide forfeit/AI/etc.

For this phase implement infrastructure/hooks.

Handle browser refresh.

Do not rely only on volatile WebSocket session ID for user identity.

==================================================
11. HOST MIGRATION
==================================================

If host leaves while room is WAITING:

assign host to another player deterministically.

Example:
oldest joined remaining player.

Broadcast HOST_CHANGED.

If room is empty:
close/delete temporary room state.

==================================================
12. DATABASE
==================================================

FIRST inspect existing database.

Do not create duplicate user structures.

Persist only what makes sense.

Prepare schema for:

game_match
game_match_player

or equivalent based on existing naming conventions.

Room waiting state can remain realtime/in-memory initially.

Match record should be able to store:

matchId
gameType
playMode (SOLO/MULTIPLAYER)
startedAt
endedAt
status
winner/team
settings snapshot

Player result:

matchId
userId
team
score
result
joinedAt
disconnected
etc.

Use migration conventions already present in project.

Do not modify existing production tables destructively.

==================================================
13. ROOM UI
==================================================

The room screen is extremely important.

Desktop layout concept:

TOP BAR
Back | Room Code | Connection | Voice placeholder

LEFT
Game settings

CENTER
Player slots / versus layout

RIGHT
Room information / invitation area

BOTTOM
Ready / Start Game

For a 1v1 room show players visually facing each other.

For 4 player room use symmetrical slots.

Each player card should display:

avatar
name
host badge
ready status
connection status
team indicator

Ready state animation:
subtle border illumination + check transition.

The room code should have:
copy button
copied feedback

Add:
loading states
empty states
error states
reconnect overlay

Do not use browser alert().

Use toast/modal components consistent with the project.

==================================================
14. RESPONSIVENESS
==================================================

Prioritize:

desktop
tablet
mobile landscape

On small screens:
settings should become a drawer/sheet.

Keep gameplay area large.

==================================================
15. FRONTEND STATE MANAGEMENT
==================================================

Create reusable GameRoom state handling.

Avoid passing room state through deeply nested components.

For the React Game Arena, use a scoped Zustand store for connection, room, countdown and reconnect state. Do not put authoritative domain rules in the store.

Existing non-game Thymeleaf pages do not need to be rewritten. If a temporary vanilla-JS Arena page remains during migration, isolate its store behind the same typed event contract so it can be replaced without changing the backend.

Prevent duplicated WebSocket listeners on re-render.

Unsubscribe listeners on unmount.

==================================================
16. SECURITY
==================================================

Validate:

roomId
roomCode
settings
user session
host privilege
room membership
message type
payload size

Rate-limit spam-prone WebSocket actions if appropriate.

Do not allow arbitrary destination subscription that exposes another private room.

==================================================
17. MATCHMAKING, REDIS AND SCALE-OUT BOUNDARY
==================================================

Provide a matchmaking abstraction even if the first UI focuses on invite/join room.

Use Redis ZSET for ELO/rating-based queue ordering when Redis is enabled. Use Redis Pub/Sub for cross-instance room/event fan-out when the application is scaled horizontally.

A development-only in-memory implementation is acceptable, but it must be selected by configuration and clearly documented. Do not silently claim multi-instance support while room state exists only inside one JVM.

Prevent a user from occupying multiple queue entries. Joining a room, disconnecting permanently or starting a match must remove the relevant queue entry idempotently.

==================================================
18. SHARED JAPANESE ANSWER VALIDATION
==================================================

Create one backend JapaneseAnswerValidationService for all later games.

Pipeline:

1. Unicode NFKC, whitespace, punctuation and configured kana normalization followed by exact/approved-alias match.
2. Conservative fuzzy/Levenshtein match with thresholds based on question type and answer length.
3. Semantic result cache for previously reviewed equivalent answers.
4. Optional asynchronous OpenAI fallback with strict timeout, failure handling and result caching.

Do not call OpenAI from the browser or from a realtime rendering loop. Do not accept every typo. Persist/cache only the minimum safe question/normalized-answer/verdict metadata and version cache keys when validation policy changes.

Provide a deterministic mode for competitive games so they can disable or fail closed on the AI layer. Manually verify Japanese normalization, short-answer fuzzy thresholds, aliases, timeout and cache behavior using the checklist below; do not require unit-test files.

==================================================
19. REQUIRED MANUAL QA SCENARIOS
==================================================

Manually verify at least:

A starts a supported solo game without creating a fake opponent or entering matchmaking

A creates room
B joins
A/B ready
A starts
countdown synchronizes
room enters IN_GAME

Also:

third user tries entering full 1v1 room
non-host edits settings
duplicate join
invalid room code
host leaves
player refreshes browser
WebSocket temporarily disconnects
user reconnects
room becomes empty
start clicked multiple times rapidly
READY sent multiple times

==================================================
20. PHASE 1 COMPLETION CRITERIA
==================================================

Phase is complete only when:

- one browser session can start an authenticated solo session for a supported game
- 2 browser sessions can enter same room
- both players appear realtime
- ready state synchronizes
- host permissions work
- room settings synchronize
- countdown synchronizes
- duplicate start does not occur
- reconnect works
- duplicate matchmaking entries are prevented
- shared exact/fuzzy answer validation passes the manual QA checklist
- UI looks polished
- Maven backend build passes
- React/Vite Game Arena build passes when the React frontend has been introduced
- existing learning features still work

At the end provide:

1. architecture summary
2. files created
3. files modified
4. DB migrations
5. REST endpoints
6. STOMP destinations, commands and events
7. manual testing instructions
8. known limitations
