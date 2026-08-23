package admin.jlas.game.modules.airdefense.service;

import admin.jlas.game.modules.airdefense.model.AirDefenseSpaceship;
import admin.jlas.game.modules.airdefense.repository.AirDefenseSpaceshipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class AirDefenseDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(AirDefenseDataInitializer.class);

    @Bean
    @Order(20)
    public ApplicationRunner airDefenseSpaceshipSeeder(AirDefenseSpaceshipRepository spaceshipRepository) {
        return args -> {
            try {
                if (spaceshipRepository.count() == 0) {
                    List<AirDefenseSpaceship> defaultShips = List.of(
                            AirDefenseSpaceship.builder()
                                    .shipId("NOVA-01")
                                    .name("NOVA-01 KITE")
                                    .role("BALANCED")
                                    .description("Tàu chiến tân thủ tiêu chuẩn, cân bằng và ổn định.")
                                    .priceCoins(0)
                                    .baseHp(100)
                                    .speedMult(1.0)
                                    .colorTheme("cyan")
                                    .createdAt(LocalDateTime.now())
                                    .build(),
                            AirDefenseSpaceship.builder()
                                    .shipId("FROSTBYTE")
                                    .name("FROSTBYTE SENTINEL")
                                    .role("CONTROL")
                                    .description("Mỗi khi gõ đúng 5 từ liên tiếp, tự động đóng băng toàn bộ quái vật trong 2 giây.")
                                    .priceCoins(800)
                                    .baseHp(120)
                                    .speedMult(0.8)
                                    .passiveSkillCode("PASSIVE_FROST_FREEZE")
                                    .colorTheme("cyan")
                                    .createdAt(LocalDateTime.now())
                                    .build(),
                            AirDefenseSpaceship.builder()
                                    .shipId("RAPTOR-7")
                                    .name("RAPTOR-7 HYPERION")
                                    .role("VELOCITY")
                                    .description("Nhận thêm +100% điểm Combo khi tốc độ gõ trên 1.5 từ/giây.")
                                    .priceCoins(1200)
                                    .baseHp(80)
                                    .speedMult(1.4)
                                    .passiveSkillCode("PASSIVE_HYPER_SPEED")
                                    .colorTheme("violet")
                                    .createdAt(LocalDateTime.now())
                                    .build(),
                            AirDefenseSpaceship.builder()
                                    .shipId("AEGIS-01")
                                    .name("AEGIS DEFENDER")
                                    .role("FORTRESS")
                                    .description("Giảm 30% sát thương va chạm khi quái vật tiếp cận phòng tuyến.")
                                    .priceCoins(1500)
                                    .baseHp(180)
                                    .speedMult(0.7)
                                    .passiveSkillCode("PASSIVE_AEGIS_SHIELD")
                                    .colorTheme("amber")
                                    .createdAt(LocalDateTime.now())
                                    .build()
                    );
                    spaceshipRepository.saveAll(defaultShips);
                    log.info("Seeded {} Air Defense spaceships", defaultShips.size());
                }
            } catch (Exception ex) {
                log.warn("Seeding spaceships skipped or already exists: {}", ex.getMessage());
            }
        };
    }
}
