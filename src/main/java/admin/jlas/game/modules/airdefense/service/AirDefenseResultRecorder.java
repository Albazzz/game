package admin.jlas.game.modules.airdefense.service;

import admin.jlas.game.modules.airdefense.domain.AirDefenseOutcome;
import admin.jlas.game.modules.airdefense.domain.AirDefenseObjective;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayerState;
import admin.jlas.game.modules.airdefense.domain.AirDefensePlayMode;
import admin.jlas.game.modules.airdefense.domain.AirDefenseSession;
import admin.jlas.game.modules.airdefense.model.AirDefenseResult;
import admin.jlas.game.modules.airdefense.repository.AirDefenseResultRepository;
import admin.jlas.game.modules.arena.model.MatchStatus;
import admin.jlas.game.modules.arena.model.PlayerResult;
import admin.jlas.game.modules.arena.repository.GameMatchPlayerRepository;
import admin.jlas.game.modules.arena.repository.GameMatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AirDefenseResultRecorder {

    private final AirDefenseResultRepository resultRepository;
    private final GameMatchRepository matchRepository;
    private final GameMatchPlayerRepository matchPlayerRepository;
    private final Clock clock;

    public AirDefenseResultRecorder(AirDefenseResultRepository resultRepository,
                                    GameMatchRepository matchRepository,
                                    GameMatchPlayerRepository matchPlayerRepository,
                                    Clock clock) {
        this.resultRepository = resultRepository;
        this.matchRepository = matchRepository;
        this.matchPlayerRepository = matchPlayerRepository;
        this.clock = clock;
    }

    @Transactional
    public Set<Long> recordFinish(AirDefenseSession session) {
        Instant finishedAt = session.getFinishedAt() == null
                ? Instant.now(clock) : session.getFinishedAt();
        boolean ranked = session.getPlayMode() == AirDefensePlayMode.MULTIPLAYER
                && session.playersByUserId().size() == 2;
        Set<Long> personalBestUserIds = new HashSet<>();
        for (AirDefensePlayerState player : session.orderedPlayers()) {
            if (resultRepository.existsBySessionIdAndUserId(
                    session.getSessionId(), player.getUserId())) {
                continue;
            }
            if (session.getPlayMode() == AirDefensePlayMode.SOLO
                    && isPersonalBest(session, player, finishedAt)) {
                personalBestUserIds.add(player.getUserId());
            }
            boolean winner = session.getWinnerUserId() != null
                    && session.getWinnerUserId().equals(player.getUserId());
            resultRepository.save(AirDefenseResult.builder()
                    .sessionId(session.getSessionId())
                    .matchId(session.getMatchId())
                    .roomId(session.getRoomId())
                    .userId(player.getUserId())
                    .playMode(session.getPlayMode())
                    .objective(session.getConfig().objective())
                    .difficulty(session.getConfig().difficulty())
                    .answerMode(session.getConfig().answerMode())
                    .level(session.getConfig().level())
                    .outcome(outcomeFor(session, player.getUserId()))
                    .hpRemaining(player.getHp())
                    .score(player.getScore())
                    .questionsAnswered(player.getCorrectAnswers() + player.getIncorrectAnswers())
                    .correctAnswers(player.getCorrectAnswers())
                    .incorrectAnswers(player.getIncorrectAnswers())
                    .accuracyPercent(player.accuracyPercent())
                    .bestCombo(player.getBestCombo())
                    .averageResponseMs(player.averageResponseMs())
                    .durationMs(session.elapsedMs(finishedAt))
                    .ranked(ranked)
                    .winner(winner)
                    .finishedAt(finishedAt)
                    .build());
        }
        updateArenaMatch(session, finishedAt);
        return personalBestUserIds;
    }

    private boolean isPersonalBest(AirDefenseSession session, AirDefensePlayerState player,
                                   Instant finishedAt) {
        List<AirDefenseResult> previous = resultRepository.findByUserIdAndPlayModeAndObjective(
                player.getUserId(), AirDefensePlayMode.SOLO, session.getConfig().objective());
        if (previous.isEmpty()) return true;

        long durationMs = session.elapsedMs(finishedAt);
        boolean scoreBest = previous.stream().allMatch(item -> player.getScore() > item.getScore());
        boolean accuracyBest = previous.stream().allMatch(
                item -> player.accuracyPercent() > item.getAccuracyPercent());
        boolean comboBest = previous.stream().allMatch(
                item -> player.getBestCombo() > item.getBestCombo());
        boolean survivalBest = session.getConfig().objective() == AirDefenseObjective.SURVIVAL
                && previous.stream().allMatch(item -> durationMs > item.getDurationMs());
        return scoreBest || accuracyBest || comboBest || survivalBest;
    }

    private AirDefenseOutcome outcomeFor(AirDefenseSession session, long userId) {
        if (session.getPlayMode() == AirDefensePlayMode.SOLO) return session.getOutcome();
        if (session.isDraw()) return AirDefenseOutcome.DRAW;
        return session.getWinnerUserId() != null && session.getWinnerUserId() == userId
                ? AirDefenseOutcome.VICTORY : AirDefenseOutcome.DEFEAT;
    }

    private void updateArenaMatch(AirDefenseSession session, Instant finishedAt) {
        if (session.getMatchId() == null) return;
        matchRepository.findById(session.getMatchId()).ifPresent(match -> {
            match.setStatus(MatchStatus.COMPLETED);
            match.setEndedAt(finishedAt);
            match.setWinnerUserId(session.getWinnerUserId());
            matchRepository.save(match);
        });
        matchPlayerRepository.findByMatchIdOrderBySlotAsc(session.getMatchId())
                .forEach(matchPlayer -> {
                    AirDefensePlayerState player = session.playersByUserId()
                            .get(matchPlayer.getUserId());
                    if (player == null) return;
                    matchPlayer.setScore(player.getScore());
                    matchPlayer.setDisconnected(!player.isConnected());
                    if (session.isDraw()) {
                        matchPlayer.setResult(PlayerResult.DRAW);
                    } else if (session.getWinnerUserId() != null
                            && session.getWinnerUserId().equals(player.getUserId())) {
                        matchPlayer.setResult(PlayerResult.WIN);
                    } else {
                        matchPlayer.setResult(PlayerResult.LOSE);
                    }
                    matchPlayerRepository.save(matchPlayer);
                });
    }
}
