package admin.jlas.game.modules.arena.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/** Envelope chuẩn cho mọi message server -> client (p1.md §8). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ArenaEvent<T>(
        String type,
        String roomId,
        Long stateVersion,
        Instant timestamp,
        T payload) {

    public static <T> ArenaEvent<T> of(String type, String roomId, Long stateVersion, T payload) {
        return new ArenaEvent<>(type, roomId, stateVersion, Instant.now(), payload);
    }

    public static ArenaEvent<Void> of(String type, String roomId) {
        return new ArenaEvent<>(type, roomId, null, Instant.now(), null);
    }
}
