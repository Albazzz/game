# Game Arena implementation phases

This directory expands the four roadmap phases in `../implementPlan.md` into smaller executable specifications.

The roadmap scope and product goals remain authoritative. The implementation details in `../implementPlan.md` and this directory are now aligned to the Java Web/MySQL architecture below.

## Canonical phase map

| Roadmap phase | Execution specification | Scope |
| --- | --- | --- |
| Phase 1 | `p1-foundation.md` | Arena, authenticated room lifecycle, ready/countdown/reconnect, shared validation and infrastructure |
| Phase 2A | `p2-memory.md` | Memory Match solo and multiplayer MVP, then 3–4 player extension |
| Phase 2B | `p2-card.md` | Card Battle for 2–4 players |
| Phase 3 | `p3-air-defense.md` | Air Defense/Cannon Battle solo and 1v1 with PixiJS |
| Phase 4A | `p4-voice.md` | WebRTC mesh voice chat |
| Phase 4B | `p4-progression.md` | Rating, level, achievements and leaderboards |
| Phase 4C | `p4-spectator.md` | Secure read-only spectator mode |

The letter suffixes are work packages inside one roadmap phase, not additional roadmap phases.

## Architecture decision: keep the Java web backend

All specifications in this directory must use the following baseline unless a later architecture decision explicitly replaces it:

- Backend: Java 21 and the existing Spring Boot application.
- HTTP/authentication: Spring MVC, Spring Security and the existing JWT/session conventions.
- Persistence: MySQL through Spring Data JPA and the existing schema/migration conventions. Do not create duplicate account or vocabulary tables and do not perform destructive database migration as part of a game phase.
- Realtime transport: the existing authenticated Spring WebSocket setup using STOMP over SockJS at `/ws-arena`. Do not introduce Socket.IO or a second realtime server.
- Scale-out: Redis Pub/Sub for cross-instance events, Redis ZSET for matchmaking/leaderboards where appropriate, and Redis for hot validation caches. A single-instance in-memory implementation may remain a documented development fallback.
- Vector/semantic search is optional and is not a reason to migrate from MySQL. Use Redis vector search only when that Redis capability is deployed; otherwise use a normalized-answer cache and the deterministic validation layers.
- Existing web UI: keep working Thymeleaf pages and learning flows.
- Game Arena UI (hybrid split, decided in Phase 2A): the **shell** — auth, `/games` catalog, lobby, room/waiting screen — stays Thymeleaf + vanilla JS + the CSS token files delivered in Phase 1. The **gameplay board of each minigame** is a React + Vite + TypeScript bundle mounted into a Thymeleaf host page under `/games/<game>/...`. Do not rewrite the working Phase 1 shell into React.
- React bundles live in `frontend/` and are built into `src/main/resources/static/arena/app/` so Spring serves them same-origin; no dev server is required to run the app.
- Realtime state inside a React game bundle uses Zustand. The Phase 1 vanilla `GameRoomStore` remains the store for the shell and is the reference implementation of the event contract.
- Tailwind CSS is used inside the React game bundles. It must consume the same design tokens as `arena/css/tokens.css` (single source of truth for color/radius/shadow), so the board and the shell cannot drift visually.
- Shared UI rules: follow [`UI_RULES.md`](UI_RULES.md) for tokens, responsive layout, accessibility, realtime states, Japanese IME and game-specific presentation.
- Air Defense rendering: PixiJS + TypeScript only. Phaser is not allowed.
- Card Battle and Memory Match rendering: React DOM + Framer Motion + Tailwind CSS. Do not move Japanese text input or card faces into canvas.
- Voice media: browser WebRTC mesh. Spring WebSocket carries signaling/control only; microphone audio never passes through the application server.

Existing stable internal identifiers such as `CANNON_BATTLE`, `CARD_DUEL` and `MEMORY_MATCH` may remain to avoid destructive data/code migration. Use Air Defense, Card Battle and Memory Match as the corresponding product-facing names and document the mapping in shared Java/TypeScript contracts.

Air Defense and Memory Match support both `SOLO` and `MULTIPLAYER`. Solo uses the same server-authoritative game engines and answer/content services, but starts from a dedicated solo-session flow without matchmaking, room ready checks or a fake opponent. Solo results are unranked and never change ELO/MMR.

## Shared implementation rules

### Server authority

The Spring backend owns room membership, permissions, game state, timers, randomization, answer verdicts and match results. Clients render server-confirmed state and send intentions only.

Room mutations must be serialized per `roomId`. Do not use one global lock for all rooms. Operations such as start, finish, reward processing and reconnect restoration must be idempotent. When multiple application instances are introduced, JVM locks alone are insufficient; use explicit room ownership or Redis-backed coordination.

### Realtime contract

Reuse the existing STOMP endpoint, authentication interceptor and destination authorization. Define typed Java DTOs for commands, events, errors and snapshots. Maintain matching TypeScript types through generated schemas or a documented payload contract.

Every event must include the minimum required metadata, such as:

```text
type
roomId or matchId
serverTimestamp
sequence/version when ordering matters
payload
```

Do not trust client-supplied user IDs, scores, answer verdicts, card ownership, timers or destinations. Never publish a complete persistence entity when a safe public DTO is sufficient.

### Japanese answer validation

All games reuse one backend `JapaneseAnswerValidationService`; they must not implement independent validators.

The shared pipeline is:

1. Unicode normalization and exact/approved-alias match.
2. Conservative fuzzy comparison under a question-type-specific threshold.
3. Semantic result cache for previously reviewed equivalent answers.
4. Optional asynchronous OpenAI fallback with a strict timeout, observable failure handling and cached reviewed result.

Exact and approved-alias results remain the default competitive path. A game must state whether an AI fallback may delay a verdict, return `PENDING`, or fail closed. Never call OpenAI from the browser, a Pixi ticker or a UI component.

### Build and compatibility

The project uses manual QA as the acceptance method; do not require new automated testcase files. Each work package must pass the Maven backend build and the Game Arena frontend build when that frontend exists. Existing authentication, lessons and vocabulary features must continue to work. Every completion report must list migrations, REST endpoints, STOMP destinations/events, configuration variables, manual verification performed and known limitations.
