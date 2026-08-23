package admin.jlas.game;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Game Arena: hạ tầng multiplayer dùng chung (lobby / room / ready / countdown /
 * reconnect), Memory Match và Air Defense cho solo lẫn multiplayer.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableJpaAuditing
@EnableScheduling
public class GameArenaApplication {

    public static void main(String[] args) {
        SpringApplication.run(GameArenaApplication.class, args);
    }
}
