package admin.jlas.game.modules.arena.support;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.UUID;

/**
 * Room code dễ đọc: bỏ các ký tự dễ nhầm (0/O, 1/I/L, U/V) để người chơi đọc
 * qua voice/chat không sai. Chống trùng do {@code RoomRegistry} dùng
 * putIfAbsent và thử lại.
 */
@Component
public class SecureRoomCodeGenerator implements RoomCodeGenerator {

    private static final char[] ALPHABET = "ACDEFGHJKMNPQRSTWXYZ23456789".toCharArray();
    private static final int GROUP = 4;

    private final SecureRandom random = new SecureRandom();

    @Override
    public String newRoomId() {
        return UUID.randomUUID().toString();
    }

    @Override
    public String newRoomCode() {
        StringBuilder sb = new StringBuilder(GROUP * 2 + 1);
        for (int i = 0; i < GROUP * 2; i++) {
            if (i == GROUP) {
                sb.append('-');
            }
            sb.append(ALPHABET[random.nextInt(ALPHABET.length)]);
        }
        return sb.toString();
    }
}
