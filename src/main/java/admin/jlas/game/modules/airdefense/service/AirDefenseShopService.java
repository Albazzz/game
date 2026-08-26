package admin.jlas.game.modules.airdefense.service;

import admin.jlas.game.common.exception.ApiException;
import admin.jlas.game.common.exception.ErrorCode;
import admin.jlas.game.modules.airdefense.dto.AirDefenseFinishMatchRequest;
import admin.jlas.game.modules.airdefense.dto.AirDefenseLeaderboardItem;
import admin.jlas.game.modules.airdefense.dto.AirDefenseShopView;
import admin.jlas.game.modules.airdefense.model.AirDefenseResult;
import admin.jlas.game.modules.airdefense.model.AirDefenseSpaceship;
import admin.jlas.game.modules.airdefense.model.UserPermanentUpgrade;
import admin.jlas.game.modules.airdefense.model.UserSpaceship;
import admin.jlas.game.modules.airdefense.repository.AirDefenseResultRepository;
import admin.jlas.game.modules.airdefense.repository.AirDefenseSpaceshipRepository;
import admin.jlas.game.modules.airdefense.repository.UserPermanentUpgradeRepository;
import admin.jlas.game.modules.airdefense.repository.UserSpaceshipRepository;
import admin.jlas.game.modules.auth.model.User;
import admin.jlas.game.modules.auth.repository.UserRepository;
import admin.jlas.game.modules.auth.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AirDefenseShopService {

    private final AirDefenseSpaceshipRepository spaceshipRepository;
    private final UserSpaceshipRepository userSpaceshipRepository;
    private final UserPermanentUpgradeRepository upgradeRepository;
    private final UserRepository userRepository;
    private final AirDefenseResultRepository resultRepository;

    public AirDefenseShopService(AirDefenseSpaceshipRepository spaceshipRepository,
                                 UserSpaceshipRepository userSpaceshipRepository,
                                 UserPermanentUpgradeRepository upgradeRepository,
                                 UserRepository userRepository,
                                 AirDefenseResultRepository resultRepository) {
        this.spaceshipRepository = spaceshipRepository;
        this.userSpaceshipRepository = userSpaceshipRepository;
        this.upgradeRepository = upgradeRepository;
        this.userRepository = userRepository;
        this.resultRepository = resultRepository;
    }

    @Transactional
    public AirDefenseShopView getShopView(UserPrincipal principal) {
        Long userId = principal.getUserId();
        UserPermanentUpgrade upgrade = getOrCreateUpgrade(userId);
        List<AirDefenseSpaceship> allShips = spaceshipRepository.findAll();
        Set<String> ownedShipIds = new HashSet<>(userSpaceshipRepository.findOwnedShipIds(userId));
        ownedShipIds.add("NOVA-01"); // Tàu mặc định luôn sở hữu

        List<AirDefenseShopView.ShipItemView> shipItems = allShips.stream().map(ship -> {
            boolean owned = ownedShipIds.contains(ship.getShipId());
            boolean equipped = ship.getShipId().equals(upgrade.getEquippedShipId());
            return new AirDefenseShopView.ShipItemView(
                    ship.getShipId(),
                    ship.getName(),
                    ship.getRole(),
                    ship.getDescription(),
                    ship.getPriceCoins(),
                    ship.getBaseHp(),
                    ship.getSpeedMult(),
                    ship.getPassiveSkillCode(),
                    ship.getColorTheme(),
                    owned,
                    equipped
            );
        }).toList();

        return new AirDefenseShopView(
                upgrade.getCoinsBalance(),
                upgrade.getEquippedShipId(),
                upgrade.getExtraBaseHpLevel(),
                upgrade.getCoinBonusLevel(),
                upgrade.getRerollCountLevel(),
                upgrade.getFastStartLevel(),
                shipItems
        );
    }

    @Transactional
    public void buyShip(UserPrincipal principal, String shipId) {
        Long userId = principal.getUserId();
        AirDefenseSpaceship ship = spaceshipRepository.findById(shipId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Không tìm thấy tàu chiến " + shipId));

        if (userSpaceshipRepository.findByUser_UserIdAndSpaceship_ShipId(userId, shipId).isPresent() || "NOVA-01".equals(shipId)) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Bạn đã sở hữu tàu chiến này rồi");
        }

        UserPermanentUpgrade upgrade = getOrCreateUpgrade(userId);
        if (upgrade.getCoinsBalance() < ship.getPriceCoins()) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Không đủ Coin để mở khóa tàu chiến này");
        }

        upgrade.setCoinsBalance(upgrade.getCoinsBalance() - ship.getPriceCoins());
        upgradeRepository.save(upgrade);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, "Người dùng không tồn tại"));

        userSpaceshipRepository.save(UserSpaceship.builder()
                .user(user)
                .spaceship(ship)
                .purchasedAt(LocalDateTime.now())
                .build());
    }

    @Transactional
    public void equipShip(UserPrincipal principal, String shipId) {
        Long userId = principal.getUserId();
        if (!"NOVA-01".equals(shipId) && userSpaceshipRepository.findByUser_UserIdAndSpaceship_ShipId(userId, shipId).isEmpty()) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Bạn chưa sở hữu tàu chiến này");
        }
        UserPermanentUpgrade upgrade = getOrCreateUpgrade(userId);
        upgrade.setEquippedShipId(shipId);
        upgradeRepository.save(upgrade);
    }

    @Transactional
    public void upgradeTalent(UserPrincipal principal, String talentType) {
        Long userId = principal.getUserId();
        UserPermanentUpgrade upgrade = getOrCreateUpgrade(userId);

        int cost = 480;
        if (upgrade.getCoinsBalance() < cost) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, "Không đủ Coin để nâng cấp (Cần 480 Coin)");
        }

        switch (talentType.toUpperCase()) {
            case "HULL", "HP" -> upgrade.setExtraBaseHpLevel(upgrade.getExtraBaseHpLevel() + 1);
            case "COIN" -> upgrade.setCoinBonusLevel(upgrade.getCoinBonusLevel() + 1);
            case "REROLL" -> upgrade.setRerollCountLevel(upgrade.getRerollCountLevel() + 1);
            case "FAST_START" -> upgrade.setFastStartLevel(upgrade.getFastStartLevel() + 1);
            default -> throw new ApiException(ErrorCode.VALIDATION_FAILED, "Loại nâng cấp không hợp lệ: " + talentType);
        }

        upgrade.setCoinsBalance(upgrade.getCoinsBalance() - cost);
        upgradeRepository.save(upgrade);
    }

    @Transactional
    public UserPermanentUpgrade getOrCreateUpgrade(Long userId) {
        return upgradeRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElse(null);
            UserPermanentUpgrade newUpgrade = UserPermanentUpgrade.builder()
                    .userId(userId)
                    .user(user)
                    .coinsBalance(1200) // Khởi tạo 1200 coin trải nghiệm
                    .extraBaseHpLevel(0)
                    .coinBonusLevel(0)
                    .rerollCountLevel(0)
                    .fastStartLevel(0)
                    .equippedShipId("NOVA-01")
                    .updatedAt(LocalDateTime.now())
                    .build();
            return upgradeRepository.save(newUpgrade);
        });
    }

    @Transactional
    public void addCoins(Long userId, int amount) {
        if (amount <= 0) return;
        UserPermanentUpgrade upgrade = getOrCreateUpgrade(userId);
        upgrade.setCoinsBalance(upgrade.getCoinsBalance() + amount);
        upgradeRepository.save(upgrade);
    }

    @Transactional
    public AirDefenseShopView recordMatchFinish(UserPrincipal principal, AirDefenseFinishMatchRequest req) {
        Long userId = principal.getUserId();
        UserPermanentUpgrade upgrade = getOrCreateUpgrade(userId);

        if (req != null && req.creditsEarned() > 0) {
            upgrade.setCoinsBalance(upgrade.getCoinsBalance() + req.creditsEarned());
            upgrade.setUpdatedAt(LocalDateTime.now());
            upgradeRepository.save(upgrade);
        }

        if (req != null && req.score() > 0) {
            User user = userRepository.findById(userId).orElse(null);
            AirDefenseResult result = AirDefenseResult.builder()
                    .sessionId("solo_" + UUID.randomUUID().toString().substring(0, 8))
                    .user(user)
                    .playMode(req.playMode() != null ? req.playMode() : "SOLO")
                    .objective("SURVIVAL")
                    .difficulty(req.difficulty() != null ? req.difficulty() : "N5")
                    .answerMode("KANJI_TO_HIRAGANA")
                    .jlptLevel(req.difficulty() != null ? req.difficulty() : "N5")
                    .outcome("FINISHED")
                    .hpRemaining(0)
                    .score(req.score())
                    .questionsAnswered(req.questionsAnswered())
                    .correctAnswers(req.correctAnswers())
                    .incorrectAnswers(req.incorrectAnswers())
                    .accuracyPercent(req.accuracyPercent())
                    .bestCombo(req.bestCombo())
                    .durationMs(req.durationMs())
                    .ranked(false)
                    .winner(false)
                    .finishedAt(LocalDateTime.now())
                    .build();
            resultRepository.save(result);
        }

        return getShopView(principal);
    }

    @Transactional(readOnly = true)
    public List<AirDefenseLeaderboardItem> getEndlessLeaderboard(UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getUserId() : null;
        List<AirDefenseResult> topResults = resultRepository.findTopEndlessScores(PageRequest.of(0, 20));

        List<AirDefenseLeaderboardItem> items = new ArrayList<>();
        int rank = 1;
        for (AirDefenseResult res : topResults) {
            User user = res.getUser();
            Long userId = user != null ? user.getUserId() : null;
            String name = "PILOT #" + rank;
            if (user != null) {
                if (user.getFullName() != null && !user.getFullName().isBlank()) {
                    name = user.getFullName();
                } else if (user.getEmail() != null) {
                    name = user.getEmail().split("@")[0].toUpperCase();
                }
            }

            String shipId = "NOVA-01";
            if (userId != null) {
                UserPermanentUpgrade up = upgradeRepository.findById(userId).orElse(null);
                if (up != null && up.getEquippedShipId() != null) {
                    shipId = up.getEquippedShipId();
                }
            }

            AirDefenseSpaceship ship = spaceshipRepository.findById(shipId).orElse(null);
            String shipName = ship != null ? ship.getName() : "NOVA-01 KITE";
            String shipTone = ship != null && ship.getColorTheme() != null ? ship.getColorTheme() : "cyan";

            int wave = Math.max(1, (res.getScore() / 5000) + 1);
            boolean isCur = currentUserId != null && currentUserId.equals(userId);

            items.add(new AirDefenseLeaderboardItem(
                    rank++,
                    userId,
                    name,
                    shipId,
                    shipName,
                    shipTone,
                    res.getScore(),
                    wave,
                    res.getBestCombo() != null ? res.getBestCombo() : 0,
                    res.getAccuracyPercent() != null ? res.getAccuracyPercent() : 0,
                    "PILOT",
                    isCur
            ));
        }

        // Nếu DB chưa có nhiều kết quả, bổ sung mock telemetry mẫu để bảng đẹp mắt
        if (items.isEmpty()) {
            items.add(new AirDefenseLeaderboardItem(1, 101L, "MIZUKI", "RAPTOR-7", "RAPTOR-7 HYPERION", "violet", 204890, 42, 45, 98, "CELESTIAL", false));
            items.add(new AirDefenseLeaderboardItem(2, 102L, "AERIS", "FROSTBYTE", "FROSTBYTE SENTINEL", "cyan", 182410, 38, 36, 95, "DIAMOND", false));
            items.add(new AirDefenseLeaderboardItem(3, 103L, "REN", "AEGIS-01", "AEGIS DEFENDER", "amber", 164720, 35, 29, 92, "PLATINUM", false));
        }

        return items;
    }

    @Transactional(readOnly = true)
    public List<AirDefenseLeaderboardItem> getRankedLeaderboard(UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getUserId() : null;
        List<AirDefenseResult> topResults = resultRepository.findTopRankedWinners(PageRequest.of(0, 20));

        List<AirDefenseLeaderboardItem> items = new ArrayList<>();
        int rank = 1;
        for (AirDefenseResult res : topResults) {
            User user = res.getUser();
            Long userId = user != null ? user.getUserId() : null;
            String name = "PILOT #" + rank;
            if (user != null) {
                if (user.getFullName() != null && !user.getFullName().isBlank()) {
                    name = user.getFullName();
                } else if (user.getEmail() != null) {
                    name = user.getEmail().split("@")[0].toUpperCase();
                }
            }

            String shipId = "NOVA-01";
            if (userId != null) {
                UserPermanentUpgrade up = upgradeRepository.findById(userId).orElse(null);
                if (up != null && up.getEquippedShipId() != null) {
                    shipId = up.getEquippedShipId();
                }
            }

            AirDefenseSpaceship ship = spaceshipRepository.findById(shipId).orElse(null);
            String shipName = ship != null ? ship.getName() : "NOVA-01 KITE";
            String shipTone = ship != null && ship.getColorTheme() != null ? ship.getColorTheme() : "cyan";

            boolean isCur = currentUserId != null && currentUserId.equals(userId);

            items.add(new AirDefenseLeaderboardItem(
                    rank++,
                    userId,
                    name,
                    shipId,
                    shipName,
                    shipTone,
                    res.getScore(),
                    1,
                    res.getBestCombo() != null ? res.getBestCombo() : 0,
                    res.getAccuracyPercent() != null ? res.getAccuracyPercent() : 0,
                    "CELESTIAL",
                    isCur
            ));
        }

        if (items.isEmpty()) {
            items.add(new AirDefenseLeaderboardItem(1, 104L, "KAITO", "RAPTOR-7", "RAPTOR-7 HYPERION", "violet", 2240, 1, 50, 99, "CELESTIAL", false));
            items.add(new AirDefenseLeaderboardItem(2, 101L, "MIZUKI", "FROSTBYTE", "FROSTBYTE SENTINEL", "cyan", 2116, 1, 44, 96, "CELESTIAL", false));
            items.add(new AirDefenseLeaderboardItem(3, 102L, "AERIS", "AEGIS-01", "AEGIS DEFENDER", "amber", 1804, 1, 32, 91, "DIAMOND", false));
        }

        return items;
    }
}
