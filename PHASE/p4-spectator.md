TASK: BUILD ROADMAP PHASE 4C — SECURE MULTIPLAYER SPECTATOR MODE

Add read-only spectating to the existing Game Arena for active and recently finished matches.

Follow `PHASE/README.md`. Keep authorization, snapshot projection and event filtering in Spring Boot. Reuse the authenticated STOMP-over-SockJS connection; do not introduce Socket.IO or a separate spectator server.

==================================================
1. SCOPE
==================================================

A permitted user can:

- open a spectatable match
- receive a safe current snapshot
- watch subsequent public match events
- see player identities allowed by room visibility policy
- leave without affecting the match
- reconnect and resume from a fresh snapshot

A spectator cannot:

- occupy a player slot
- ready/start/pause/finish a match
- flip/play/fire/answer for a player
- change room settings
- join player or voice state implicitly
- receive private hands, hidden cards, expected answers or future random order

Spectator voice participation is out of scope unless a later explicit moderation design enables it.

==================================================
2. VISIBILITY POLICY
==================================================

Extend room/match settings with an explicit spectator policy:

DISABLED
FRIENDS_OR_INVITE_ONLY if the product supports relationships/invites
ROOM_CODE
PUBLIC

Default private rooms to DISABLED unless the host explicitly enables an allowed policy.

Solo sessions are not spectatable in the initial release. Do not publish a spectator destination for a solo match.

The Spring server validates policy on every join and subscription. A guessed `matchId`, room code or STOMP destination must not bypass authorization.

Support a configurable spectator capacity per match. Reject excess joins with a typed error instead of degrading player traffic.

==================================================
3. IDENTITY AND MEMBERSHIP
==================================================

Derive spectator identity from the authenticated principal, never from a client-supplied user ID.

Track lightweight membership:

spectatorId/userId
matchId
connected
joinedAt
lastSeenAt

Do not add spectators to `game_match_player` or count them as competitors. Persist viewer analytics only if there is a defined product need and privacy policy; otherwise keep transient membership in realtime state.

A user already participating in the match must use the player view, not create a second spectator identity.

==================================================
4. STOMP DESTINATIONS AND AUTHORIZATION
==================================================

Use explicit commands such as:

SPECTATOR_JOIN
SPECTATOR_LEAVE
SPECTATOR_RESYNC_REQUEST

Use server events such as:

SPECTATOR_JOINED
SPECTATOR_LEFT
SPECTATOR_SNAPSHOT
SPECTATOR_EVENT
SPECTATOR_COUNT_CHANGED
SPECTATOR_ERROR

Exact destination paths must follow the existing `/app`, `/topic` and `/user/queue` conventions.

The inbound channel interceptor must authorize spectator subscriptions against current match policy and membership. Do not allow arbitrary subscription to a predictable `spectate:{id}` topic.

Send join errors and initial snapshots through an authorized private user destination. A shared spectator topic may carry only a pre-sanitized public event projection.

==================================================
5. SAFE SPECTATOR PROJECTION
==================================================

Create dedicated Java DTOs/projections for spectator state. Do not reuse full internal game state or player-specific reconnect DTOs.

Common public snapshot fields may include:

matchId
gameType
status
serverTimestamp
version/sequence
public settings
public player summaries
public score/HP/turn state
public elapsed/remaining time
public board or battlefield state allowed by that game

Every game module implements a spectator projector that defines exactly what is public.

Use allowlists, not a blacklist that attempts to remove secrets after serialization.

==================================================
6. GAME-SPECIFIC PRIVACY
==================================================

Air Defense:

- spectator may see aircraft positions derived from public timestamps, HP, score and confirmed effects
- do not expose expected answers, upcoming questions or a player's partially typed answer
- question text is visible only if the product explicitly defines the match as public-question spectating

Card Battle:

- never expose player hands, future deck order or accepted answers
- show only played/discarded cards, public effects, public score/HP and turn state
- use hand/deck counts rather than hidden card identities

Memory Match:

- hidden cards contain only safe instance ID/position
- reveal content only after the server emits the corresponding public reveal event
- do not expose `pairId`, hidden content or matching metadata

==================================================
7. SNAPSHOT AND LIVE EVENTS
==================================================

Join flow:

1. Client sends SPECTATOR_JOIN.
2. Server authenticates and validates policy/capacity.
3. Server records transient spectator membership.
4. Server sends a private sanitized snapshot with current version.
5. Server authorizes/subscribes the client to subsequent sanitized events.

Avoid a gap between snapshot and live events. Use a match version/sequence and either buffer newer events during snapshot creation or require a resync when the client detects a gap.

Do not replay raw internal domain events if they may contain secrets. Project and sanitize before publishing.

==================================================
8. SERVER LOAD AND SCALE-OUT
==================================================

Player gameplay has priority over spectators.

- rate-limit join/resync commands
- cap spectators per match
- coalesce high-frequency purely visual updates
- never broadcast per-frame positions
- disconnect or degrade spectator updates before affecting authoritative game processing

For multiple Spring instances, use the shared room ownership/Redis Pub/Sub strategy from Roadmap Phase 1. Publish only sanitized spectator events across Redis channels.

==================================================
9. DELAY OPTION
==================================================

Keep the architecture extensible for an optional configured spectator delay for competitive matches.

If enabled, delay only sanitized spectator events and preserve sequence order. Do not delay authoritative player events. A first release may set delay to zero but must not hardcode assumptions that make delayed delivery impossible later.

==================================================
10. UI
==================================================

Provide a distinct spectator shell in the React Game Arena:

- clear SPECTATING badge
- match/game title
- public player score/status
- spectator count if policy permits
- connection/reconnecting state
- leave spectator action
- disabled/absent gameplay controls

Reuse the actual game renderers in an explicit read-only mode where safe. Read-only must also be enforced by the server; hiding buttons is not security.

Do not mount Japanese answer input, ready controls, private hand UI or room settings controls for spectators.

==================================================
11. RECONNECT AND MATCH END
==================================================

On reconnect, re-authenticate and request a new safe snapshot. Do not rely only on a previous WebSocket session ID.

When the match finishes:

- publish the public final result
- stop gameplay event production
- allow a short configurable result-view window if desired
- remove transient spectator memberships when the match is closed/expired

If visibility changes or the host closes spectating, revoke subscriptions and notify affected spectators with a typed reason.

==================================================
12. MANUAL SECURITY QA
==================================================

Manually verify at least:

authorized public join
private/disabled match rejection
invalid match ID
guessed topic subscription
spectator sends gameplay command
player attempts duplicate spectator identity
capacity exceeded
rapid join/leave/resync spam
visibility revoked during match
browser refresh/reconnect
event sequence gap
multi-instance delivery when Redis is enabled

Inspect browser network payloads and runtime state for:

opponent Card Battle hands
future deck order
Memory pair IDs/hidden content
Air Defense expected answers/upcoming questions
private account fields

==================================================
13. COMPLETION CRITERIA
==================================================

The phase is complete only when:

- an authorized third browser can join an active 1v1 match as a spectator
- the two players remain unaffected
- the spectator receives a consistent snapshot and ordered live events
- reconnect/resync works
- every game has an explicit safe spectator projection
- no hidden game/account data is visible in payloads or client state
- spectator gameplay commands and unauthorized subscriptions are rejected server-side
- spectator load is bounded and does not increase player event latency materially
- Maven backend and React/Vite frontend builds pass

At completion report:

1. Java services/projectors created
2. files modified
3. STOMP commands, destinations and events
4. visibility/configuration properties
5. Redis channels/keys if used
6. manual security verification
7. known limitations and current spectator capacity
