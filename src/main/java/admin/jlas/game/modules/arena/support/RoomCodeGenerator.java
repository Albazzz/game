package admin.jlas.game.modules.arena.support;

/** Định danh phòng an toàn: id nội bộ (UUID) + room code ngắn để share. */
public interface RoomCodeGenerator {

    String newRoomId();

    String newRoomCode();
}
