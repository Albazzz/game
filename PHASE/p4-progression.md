TASK: BUILD ROADMAP PHASE 4B — GAME PROGRESSION, RANKING AND PLAYER PROFILE

Follow `PHASE/README.md`. Implement authoritative progression in Spring Boot services using the existing account identity, Spring Data JPA repositories and transaction conventions. Game/profile UI may be React-based inside the Arena, while existing Thymeleaf learning pages remain supported.

The core multiplayer games exist.

Build the metagame/progression layer.

Features:

Game Profile
XP
Level
Rank/MMR
Leaderboard
Achievements
Match History
Learning/Game Statistics

==================================================
1. GAME PROFILE
==================================================

Extend the existing user system.

Do NOT create another independent account.

Game profile should reference existing User.

Display:

avatar
display name
game level
XP
rank
games played
multiplayer wins
multiplayer win rate
solo runs/completions
solo personal bests by game/preset
accuracy
favorite game
recent achievements

==================================================
2. XP SYSTEM
==================================================

XP should reward participation and learning.

Possible inputs:

completed match
win
correct answers
accuracy
streak
difficulty
first game of day if desired later

Do not reward intentionally farming extremely short/invalid matches.

Server calculates XP.

Client only displays result.

Create centralized:

GameXpService

Do not duplicate XP formulas in each game.

==================================================
3. LEVEL SYSTEM
==================================================

Create predictable progression.

Example conceptual curve:

Level 1 → easy
then gradually increasing XP requirements.

Use formula/config rather than hundreds of hardcoded values unless product requirements require table.

Display:

current XP
XP required next level
progress bar

Level should represent game engagement, not Japanese JLPT competence.

Do not misleadingly equate:
Level 50 = N1.

==================================================
4. COMPETITIVE RATING
==================================================

Create separate competitive rating if appropriate.

Do not mix XP and skill rating.

Example:

XP:
progression/participation.

MMR:
competitive skill.

Initially use a well-defined Elo-style system for 1v1. The Spring backend calculates every rating change from a finalized authoritative match; clients never submit deltas.

Air Defense and Memory Match solo sessions are always unranked. They must never change ELO/MMR, ranked win/loss totals or competitive leaderboard position.

Solo may grant capped XP, learning statistics, personal bests and achievements explicitly marked as solo-compatible. Apply anti-farming rules and do not classify completing a solo board/run as a multiplayer victory.

Store rating history.

For team/FFA matches:
implement a documented deterministic extension or initially mark those modes unranked until reliable rating logic is implemented.

Do not improvise mathematically inconsistent rating changes.

==================================================
5. RANK TIERS
==================================================

Map rating ranges to visual tiers.

Create original names/design.

Example structure:

Bronze
Silver
Gold
Sakura
Diamond
Master

Names may be refined to fit product branding.

Do not copy another game's exact rank iconography.

Each rank should have:

name
threshold
visual theme
icon/badge
progress toward next tier

==================================================
6. LEADERBOARDS
==================================================

Implement:

Global

By game:
Cannon
Card
Memory

Potential time filters:

All Time
Season
Monthly

Initial version can support global/all-time if season logic does not yet exist.

Leaderboard rows:

rank number
avatar
player name
rating
wins
win rate

Highlight current user.

Use pagination/cursor.

Do not fetch every user.

==================================================
7. MATCH HISTORY
==================================================

Create Match History page/component.

Each entry:

game type
play mode (SOLO/MULTIPLAYER)
date/time
opponents when multiplayer
result
score
accuracy
rating change
duration

Solo history shows objective/preset and personal-best comparison, with no opponent and no rating change.

Click match:

Match Details

Show:

participants
settings
question stats
score
accuracy
important game statistics

Never expose another player's private answer text if privacy policy/design does not require it.

==================================================
8. LEARNING ANALYTICS
==================================================

This feature should connect gaming back to Japanese learning.

Track aggregate information such as:

most frequently incorrect terms
most frequently correct terms
average answer time
Kanji accuracy
reading accuracy
meaning accuracy
accuracy by JLPT level

Allow:

Review Weak Words

This should connect to existing vocabulary/review system.

Do not create isolated copies of vocabulary.

==================================================
9. ACHIEVEMENTS
==================================================

Create achievement framework, not hardcoded frontend-only badges.

Achievement definition:

achievementId
code
name
description
icon
category
conditionType
conditionValue
hidden
XPReward if used

User achievement:

userId
achievementId
unlockedAt
progress

Examples:

FIRST_BATTLE
Play first match.

FIRST_WIN
Win first match.

SHARPSHOOTER
Achieve 100% accuracy in Cannon with minimum question count.

COMBO_10
Reach 10-answer streak.

MEMORY_MASTER
Complete Memory match without mismatch threshold.

CARD_TACTICIAN
Win Card Duel after activating several special card effects.

VETERAN
Complete 100 matches.

Create architecture allowing new achievements without modifying many unrelated components.

==================================================
10. ACHIEVEMENT EVENT ENGINE
==================================================

Games emit normalized progression events after authoritative actions.

Examples:

MATCH_COMPLETED
MATCH_WON
ANSWER_CORRECT
ANSWER_WRONG
COMBO_REACHED
PAIR_MATCHED
CARD_EFFECT_USED

Achievement service consumes valid events/stat summaries.

Prevent client from submitting fake achievement events directly.

==================================================
11. POST-MATCH REWARD SCREEN
==================================================

After game result:

show staged reward animation:

Victory/Defeat
↓
statistics
↓
XP earned
↓
XP bar animation
↓
level up if any
↓
rating change
↓
achievement unlocked

Do not dump everything instantly into a table.

Keep entire sequence reasonably short/skippable.

==================================================
12. PROFILE UI
==================================================

Premium game profile.

Header:

avatar
name
rank badge
level
XP bar

Stats cards:

matches
wins
accuracy
streak

Sections:

Overview
Match History
Achievements
Statistics

Use polished data visualization where useful.

Avoid standard enterprise dashboard appearance.

==================================================
13. ACHIEVEMENT UI
==================================================

Achievement collection should feel rewarding.

States:

Unlocked
Locked
In Progress
Secret

Show progress when applicable:

73 / 100

Unlocked achievement:
subtle shine / visual completion.

Do not overuse particle effects in static profile page.

==================================================
14. DATABASE
==================================================

Inspect existing schema first.

Likely concepts needed:

game_profile or profile fields
game_rating
game_rating_history
game_match
game_match_player
game_player_stats
achievement_definition
user_achievement

Avoid storing easily derived duplicated data unless needed for performance.

Use proper indexes for:

user match history
leaderboard rating
game type
finishedAt
achievement lookup

==================================================
15. TRANSACTIONS
==================================================

Final match processing is important.

Match finish should reliably process:

match result
player statistics
XP
rating
achievements

Use transaction boundaries where necessary.

Make processing idempotent.

If MATCH_FINISHED event arrives twice:
do NOT grant XP twice.

Create a processed/finalized protection strategy.

==================================================
16. API SECURITY
==================================================

Client cannot submit:

"I gained 500 XP"
"I won"
"My rating is 3000"
"I unlocked achievement"

Server derives those from authoritative match result.

==================================================
17. PERFORMANCE
==================================================

MySQL persistence is the durable source of truth. Use indexed queries for durable leaderboard/history data and Redis ZSET as an optional fast leaderboard/matchmaking index.

Redis entries must be rebuildable from the database. Rating finalization updates durable data transactionally and updates/invalidate Redis idempotently after commit; do not make Redis the only copy of a player's rating.

Match history paginated.

Avoid N+1 user/avatar queries.

Cache static achievement definitions if appropriate.

Keep reward calculation, match finalization, rating calculation and achievement evaluation in separate Spring domain services. Do not place this logic in STOMP controllers or React components.

==================================================
18. UI MICROINTERACTIONS
==================================================

Add polished:

XP bar fill
rank change
achievement unlock
leaderboard position highlight
match-result reveal
number count-up
hover details

Keep effects tasteful.

==================================================
19. MANUAL QA
==================================================

Manually verify:

solo Air Defense XP/statistics with rating unchanged
solo Memory Match XP/statistics with rating unchanged
solo result cannot increment multiplayer wins
solo-compatible and multiplayer-only achievement eligibility
XP once per match
duplicate match finalization
rating winner/loser
draw
achievement unlock
achievement already unlocked
achievement progress
leaderboard order
pagination
match history
zero matches user
large statistics
team game
disconnect result
invalid match
concurrent finish event

==================================================
20. COMPLETION CRITERIA
==================================================

A user can:

play a match
finish
receive XP
see statistics
see match in history
gain rating where ranked
unlock achievements
appear in leaderboard

All values must come from backend authoritative results.

The Maven backend and Game Arena frontend builds must pass. Document database migrations/indexes, Redis keys and rebuild procedure, REST endpoints, STOMP reward events, transaction/idempotency strategy and rollback/retry behavior.

UI must feel integrated with the Game Arena design.

Run all existing builds and perform the manual QA scenarios above.

Finish with:
architecture summary
DB changes
new endpoints
services
screens
formulas
security considerations
manual verification results
known limitations
