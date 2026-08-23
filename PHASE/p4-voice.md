TASK: BUILD ROADMAP PHASE 4A — MULTIPLAYER VOICE CHAT

Add voice chat to the existing Game Arena.

Follow `PHASE/README.md`. WebRTC media runs in the browser. Reuse the authenticated Spring STOMP connection for signaling/control and keep signaling authorization in the Java backend. Do not introduce Socket.IO or a separate signaling server.

Supported room size:
2–4 players.

Use:

WebRTC for audio media.

Use existing authenticated WebSocket infrastructure only for signaling/control.

Do NOT stream microphone audio through WebSocket.

==================================================
1. ARCHITECTURE
==================================================

Initial architecture:

WebRTC mesh.

Because rooms contain maximum 4 players.

Each player establishes peer connections with other room players.

Example 4 users:

A ↔ B
A ↔ C
A ↔ D
B ↔ C
B ↔ D
C ↔ D

Keep abstraction extensible so an SFU can replace mesh in future if scale changes.

==================================================
2. SIGNALING
==================================================

Use typed STOMP commands/private events over the existing WebSocket connection for:

VOICE_JOIN
VOICE_LEAVE
WEBRTC_OFFER
WEBRTC_ANSWER
ICE_CANDIDATE
VOICE_STATE_CHANGED

Server must verify:

sender belongs to room
target belongs to same room

Do not allow signaling to arbitrary user IDs outside room.

==================================================
3. STUN/TURN
==================================================

Configure ICE servers through environment configuration.

Never hardcode production TURN username/password.

Support:

STUN
TURN

Bind ICE configuration through Spring configuration properties/environment variables and expose only the browser-safe ICE server payload through an authenticated endpoint or room bootstrap response.

Document required variables.

==================================================
4. PERMISSION FLOW
==================================================

Do not immediately trigger microphone permission unexpectedly when user merely visits Arena.

Ask when:

user enters voice
or enables microphone.

UI:

JOIN VOICE

Then browser permission.

Handle:

permission denied
no microphone
device unavailable
browser unsupported

Show friendly error state.

==================================================
5. VOICE UI
==================================================

Inside game room:

compact voice panel.

Each player row/avatar:

avatar
name
microphone state
speaking indicator
connection state

Controls:

Join Voice
Leave Voice
Mute/Unmute
Deafen/Undeafen if implemented
volume settings

During gameplay:
minimize panel so it does not obstruct game.

==================================================
6. SPEAKING INDICATOR
==================================================

Use Web Audio API / analyser where appropriate to detect approximate local audio activity.

Animate avatar border while speaking.

Do not transmit unnecessary raw audio level data at high frequency through server if it can be determined locally/remotely.

==================================================
7. DEVICE SETTINGS
==================================================

If browser supports:

list audio input devices after permission.

Allow selection:

Default Microphone
Other microphone

Optionally output device if browser support allows.

Persist user's preference locally where safe.

==================================================
8. CONNECTION MANAGEMENT
==================================================

Implement a TypeScript `VoicePeerManager` owned at Game Arena/room scope, outside individual game components.

Responsibilities:

peer map
RTCPeerConnection lifecycle
offer/answer
ICE candidate handling
remote streams
cleanup
reconnect
room leave

Prevent duplicated peer connections.

Avoid renegotiation loops/glare.

Use deterministic offer initiator rule if needed.

Example:
lower stable playerId creates offer.

==================================================
9. GAME INTEGRATION
==================================================

Voice should continue across:

room waiting
countdown
gameplay
result screen

until user leaves room/voice.

Mounting or unmounting the PixiJS Air Defense component, Card Battle route, Memory Match route or result screen must NOT destroy voice connections.

Therefore the voice service belongs above individual game component/route lifecycle and is destroyed only when the user leaves voice or the room.

==================================================
10. RECONNECT
==================================================

If the STOMP/WebSocket connection reconnects:

re-establish signaling state if needed.

If RTCPeerConnection fails:
attempt ICE restart/reconnection appropriately.

Show states:

Connected
Connecting
Reconnecting
Failed

Do not silently leave broken peer connection forever.

==================================================
11. PRIVACY
==================================================

Microphone must only be active after explicit user action/permission.

Clearly show active/muted state.

Stop MediaStream tracks when user leaves voice.

Do not keep microphone capture alive after leaving room.

==================================================
12. GAME ANSWER PRIVACY
==================================================

Voice chat is intentionally social.

However text answer submissions must never be sent through voice signaling messages.

Voice infrastructure and game-answer infrastructure remain separated.

==================================================
13. MOBILE
==================================================

Handle mobile browser constraints.

Manually verify:

page visibility changes
screen rotation
audio context resume after interaction
device sleep/reconnect where feasible.

==================================================
14. MANUAL QA SCENARIOS
==================================================

2 users voice
3 users
4 users

mute
unmute
leave voice
rejoin
deny permission
refresh page
disconnect Wi-Fi briefly
WebSocket reconnect
one peer fails
leave game room
switch from room to game scene
finish game

Ensure no lingering microphone stream.

==================================================
15. COMPLETION CRITERIA
==================================================

4 browser sessions should be capable of entering one room and communicating through voice.

Gameplay WebSocket latency must not depend on voice traffic.

No microphone audio passes through application WebSocket server.

Provide configuration/documentation for STUN/TURN deployment.

The Spring server must use private user destinations for offer/answer/ICE delivery and verify both participants against current room membership on every signal. The Maven backend and React/Vite frontend builds must pass, and manual network inspection must confirm that no signaling subscription exposes another private room. Do not add automated testcase files.
