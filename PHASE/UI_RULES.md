# Game Arena UI rules

This document is the shared UI contract for every Game Arena screen. A phase may add game-specific details, but it must not contradict these rules.

## 1. Product boundary

- Keep existing lesson, authentication and account pages working.
- Game Arena is visually distinct from lesson pages while reusing the product's navigation, identity and toast/modal conventions.
- Use React + TypeScript for gameplay board screens. The Arena shell (auth, catalog, lobby, room) stays Thymeleaf + vanilla JS as built in Phase 1 and must not be rewritten.
- One token source: `arena/css/tokens.css` defines the CSS custom properties; the Tailwind config inside a React game bundle maps its theme onto those same variables. Do not create one-off colors, shadows, radii or typography values inside each game.
- A React board page is hosted by a Thymeleaf template so navigation, fonts, toast container and the auth cookie behave identically to the rest of the Arena.

## 2. Visual language

- Use a high-contrast Japanese anime/arcade identity: dark or deep-neutral surfaces, a restrained accent palette, readable status colors and a clear primary action.
- Define semantic tokens such as `surface`, `surfaceRaised`, `textPrimary`, `textMuted`, `accent`, `success`, `warning`, `danger`, `focus` and `disabled`.
- Never communicate state by color alone. Pair color with text, icon, shape or motion.
- Maintain readable contrast for body text, controls and status labels. Focus indicators must remain visible on every surface.
- Use Noto Sans JP, Zen Maru Gothic or an approved project fallback for Japanese. Use a display/pixel font only for decorative numbers; never use it for instructions, answer input or small status text.
- Render furigana with semantic `<ruby><rt>` markup where applicable. Do not bake learning text into images.
- Use original illustrations and effects. Do not imitate a copyrighted card game's exact layout or iconography.

## 3. Reference and inspiration rules

It is encouraged to study comparable games before implementing a screen. Use references to learn interaction patterns and hierarchy, not to reproduce a commercial game's identity.

Useful reference categories:

- Japanese arcade/party games: large readable CTAs, playful lobby composition and immediate feedback.
- Tower-defense/shooter games: clear battlefield/HUD separation, wave/danger telegraphing and impact feedback.
- Card battlers: hand hierarchy, active-card focus, turn ownership, effect chips and readable timers.
- Memory/board games: calm grid rhythm, tile readability, reveal/match feedback and low visual noise.
- Learning apps: question direction, progress feedback, mistake explanation and review links.

For each major screen, record a small inspiration note containing:

- reference category or game pattern
- interaction problem it solves
- original adaptation in this product
- accessibility and mobile considerations

Do not copy proprietary logos, characters, illustrations, card frames, exact iconography, sound effects, names, text, distinctive animation sequences or a near-identical screen composition. Do not trace screenshots. Use original CSS/SVG/illustration work or assets with a compatible license.

The final screen must be recognizable as this product's Game Arena through its own token system, Japanese-learning content treatment, layout decisions and motion language.

## 4. Layout and responsive behavior

- Design desktop first, then tablet and mobile landscape. The game board/playfield remains the visual priority.
- Use fluid sizing and CSS grid/flex layouts; do not depend on fixed viewport coordinates.
- Respect mobile safe-area insets and browser address-bar changes.
- On small screens, move room settings, invitation details and voice controls into a drawer/sheet. Do not shrink Japanese text until it becomes unreadable.
- Memory boards must preserve a usable minimum card size. Prefer scrolling or a deliberate scale control over tiny cards.
- Air Defense keeps the Pixi canvas large and lets HUD/input occupy DOM regions around it.
- Card Battle keeps the active challenge and hand visible before secondary information.
- Provide landscape and narrow-width empty/loading/error states that do not overflow horizontally.

## 5. Required UI state model

Every realtime screen must visibly handle:

- initial loading
- connecting
- connected/ready
- waiting for another player
- countdown
- active turn/game
- resolving server action
- reconnecting
- connection failed
- finished/result
- permission denied or validation error
- empty/unavailable state

Use inline status, banners, toasts or modal components consistent with the app. Never use `alert()`, `confirm()` or an unstyled browser prompt.

While a server action is pending, prevent duplicate submission and show a small pending state. Re-enable controls only after a server response, timeout or explicit error.

## 6. Server-authoritative rendering

- The server owns room membership, turn, timers, score, HP, card state, answer verdict, result and permissions.
- UI renders the latest valid server snapshot/event and sends intentions only.
- Never declare a win, match, damage, card effect or answer verdict optimistically.
- Derive countdown/timer presentation from the server timestamp/deadline. Do not use an independent timer as game authority.
- Use event sequence/version data to ignore stale events and request a resync on a gap.
- Use optimistic motion only for harmless visual anticipation; reconcile it to the next server-confirmed state.
- Do not show hidden answers, future deck order, hidden card content or private player data merely because a component could render it.

## 7. Japanese input and learning content

- Answer input must be a real accessible HTML input, never a canvas text field.
- Preserve Japanese IME composition. Do not submit or clear the field on Enter while `isComposing` is true; submit only after composition ends.
- Do not steal focus when a server event arrives. Restore focus after a result only when it is safe and expected.
- Show the question type and answer direction clearly, for example “Kanji → Hiragana”.
- Do not reveal the expected answer before the server resolves the submission.
- Normalize/validate answers on the backend. The UI may show input guidance but must not implement a competing verdict.
- Support keyboard navigation, visible focus, paste and mobile composition without requiring a mouse.

## 8. Game-specific rules

### Arena and room

- Game cards show title, visual, description, player range, mode tags and explicit CTAs.
- Cannon Battle/Air Defense and Memory Match expose `Play Solo` and multiplayer actions; Card Battle only exposes modes it supports.
- Room UI shows room code, copy feedback, connection state, player slots, settings ownership and ready/start state.
- Host-only controls are visibly disabled for non-hosts, but the backend remains the security authority.

### Air Defense

- Pixi renders battlefield objects and effects; React DOM renders Japanese input, HUD, network state and result UI.
- Keep essential HP, score, question and answer controls outside the canvas so they remain readable and accessible.
- Screen shake, flash and sound are reserved for meaningful events. Never make every typo shake the whole page.
- Solo labels must describe personal challenge/progress, not an invented opponent or multiplayer victory.

### Memory Match

- Each card is an accessible button with a clear face-down, revealed and matched state.
- Do not place all hidden card answers or pair identifiers in the initial DOM/JavaScript.
- Flip animation must preserve state when reduced motion is enabled; matched state must remain understandable without animation.
- Score, moves, mistakes, objective and timer are always visible without covering the board.
- Solo uses personal progress language; multiplayer shows turn ownership and opponent score.

### Card Battle

- The hand, active challenge, turn owner, timer and expected action remain visually dominant.
- Hidden hands and future cards never appear in the DOM or accessibility tree.
- Targetable cards/avatars receive a clear focus/selection treatment. Invalid targets explain why they cannot be selected.
- Effects show a short readable label and a server-confirmed result; animation must not be the only explanation.

### Voice and spectator

- Do not request microphone permission merely by opening the Arena. Ask after an explicit Join Voice action.
- Show microphone, speaking, connecting, failed and muted states in text/icon form.
- Spectators always see a `SPECTATING` badge and no gameplay controls. Read-only styling is not a substitute for server authorization.

## 9. Animation and sound

- Use Framer Motion/CSS for DOM animation and Pixi effects only inside the Air Defense canvas.
- Animate transitions from server-confirmed actions: deal, flip, reveal, hit, effect, score, turn and result.
- Keep animation durations short enough for competitive feedback and provide a `prefers-reduced-motion` path.
- Never block an answer or essential control behind an animation.
- Avoid continuous high-cost effects on low-power/mobile devices. Stop tickers/listeners on unmount.
- Sound is opt-in where permission/autoplay rules require it, with mute and volume controls. Never load random external media URLs.

## 10. Accessibility and feedback

- Prefer semantic HTML and native buttons/inputs.
- Provide visible keyboard focus and logical tab order.
- Use `aria-live` sparingly for countdown, connection errors and result announcements; do not announce every animation frame.
- Provide text alternatives for icons and status colors.
- Toasts must not be the only place an important error appears. Keep actionable errors near the affected control.
- Ensure dialogs/drawers trap focus, have a labelled close action and return focus to the opener.

## 11. Manual UI acceptance checklist

For each phase, manually verify on desktop and mobile landscape:

- first-load, loading, empty and error states
- slow network, reconnect and stale snapshot behavior
- keyboard/IME input and visible focus
- reduced-motion preference
- solo and multiplayer mode labels
- no horizontal overflow or unreadable Japanese text
- no hidden game data in initial DOM/network payloads
- duplicate clicks do not duplicate actions
- result screen clearly distinguishes ranked multiplayer from unranked solo
