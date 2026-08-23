IMPORTANT GLOBAL RULES

You are working inside an EXISTING Japanese-learning web application.

Before writing or modifying ANY code:

1. Read the entire relevant project structure first.
2. Identify:
   - frontend framework and version
   - backend framework and version
   - authentication system
   - current User model
   - current vocabulary/Kanji tables
   - current API conventions
   - current database schema
   - current CSS/design system
   - existing WebSocket implementation if any
3. Reuse existing architecture whenever possible.
4. DO NOT rewrite working modules unnecessarily.
5. DO NOT create duplicated User/Vocabulary/Kanji systems.
6. DO NOT change existing APIs unless absolutely necessary.
7. DO NOT hardcode secrets, database credentials, API keys, TURN credentials or JWT secrets.
8. All new configuration must use environment variables/config files according to existing project conventions.
9. Backend must remain authoritative for multiplayer game state.
10. Client must NEVER be allowed to directly decide:
    - score
    - HP
    - winner
    - correct answer
    - current turn
    - item effect
    - card result
11. All user input must be validated on the backend.
12. AI must NOT be called during realtime answer checking.
13. Japanese answers should support proper Unicode normalization.
14. Preserve Japanese IME input compatibility.
15. Avoid SQL injection, XSS and trusting WebSocket payloads.
16. Keep game modules separated from the normal learning application.
17. Build reusable multiplayer infrastructure instead of implementing each game as an isolated system.
18. UI quality is a FIRST-CLASS REQUIREMENT, not an afterthought.
19. Do not use generic Bootstrap-looking admin UI for the game.
20. Keep the visual design consistent with a premium Japanese-learning game.

TARGET VISUAL LANGUAGE

Style:
- modern Japanese arcade
- premium educational gaming
- clean rather than childish
- subtle Sakura influence
- dark navy / near-black backgrounds
- Sakura pink / magenta accents
- soft cyan only when needed for opponent/team contrast
- glass panels used sparingly
- subtle glow
- cinematic transitions
- high-quality typography
- clear hierarchy
- animated micro-interactions
- responsive layout
- readable Japanese characters

Avoid:
- excessive neon everywhere
- excessive gradients
- cheap mobile-game appearance
- clutter
- huge blocks of text
- random emoji as final production icons
- inconsistent border radius
- generic dashboard appearance

Use a proper icon library already installed in the project, otherwise select one lightweight consistent icon set.

ANIMATION PRINCIPLES

Animations must:
- communicate game state
- usually stay between 120–400ms for UI interactions
- use longer animation only for important events
- not block gameplay unnecessarily
- respect prefers-reduced-motion where applicable

NETWORKING PRINCIPLE

Use the following flow:

Client action
→ WebSocket
→ Server validation
→ Server updates authoritative GameState
→ Server broadcasts event/state
→ Clients render result

Never:

Client action
→ client modifies authoritative score/state
→ tells server what happened

DATABASE PRINCIPLE

Realtime temporary state should not generate unnecessary database writes every frame.

Persist:
- matches
- participants
- final result
- relevant statistics
- rating changes
- selected game settings
- important audit/game events if necessary

Keep high-frequency temporary state in server memory/game room state unless the existing architecture provides Redis or another appropriate realtime store.

DEVELOPMENT WORKFLOW

For this task:

Step 1:
Inspect relevant files.

Step 2:
Explain the architecture you discovered.

Step 3:
Provide an implementation plan and list files that will be created/modified.

Step 4:
Implement the feature.

Step 5:
Run available tests/build/linter.

Step 6:
Fix errors caused by your changes.

Step 7:
Review the implementation for:
- race conditions
- WebSocket security
- reconnect behavior
- duplicate events
- invalid states
- SQL issues
- frontend memory leaks
- Phaser scene cleanup
- timer cleanup

Step 8:
Report:
- files changed
- database changes
- new API endpoints
- WebSocket events
- environment variables
- how to run/test
- remaining limitations

Do not stop after merely producing a plan unless there is a genuine blocking technical issue.