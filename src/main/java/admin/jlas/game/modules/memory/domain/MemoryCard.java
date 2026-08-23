package admin.jlas.game.modules.memory.domain;

/**
 * Thẻ trên bàn. {@code pairId} là bí mật server-side — không bao giờ được đưa vào
 * DTO gửi client (p2-memory §4, §14).
 */
public class MemoryCard {

    private final String cardInstanceId;
    private final int pairId;
    private final int position;
    private final MemoryCardFace face;
    private final String content;

    private MemoryCardState state = MemoryCardState.HIDDEN;
    /** userId đã ghép được cặp này (để tô màu theo người chơi). */
    private Long matchedByUserId;

    public MemoryCard(String cardInstanceId, int pairId, int position,
                      MemoryCardFace face, String content) {
        this.cardInstanceId = cardInstanceId;
        this.pairId = pairId;
        this.position = position;
        this.face = face;
        this.content = content;
    }

    public String getCardInstanceId() {
        return cardInstanceId;
    }

    public int getPairId() {
        return pairId;
    }

    public int getPosition() {
        return position;
    }

    public MemoryCardFace getFace() {
        return face;
    }

    public String getContent() {
        return content;
    }

    public MemoryCardState getState() {
        return state;
    }

    public void setState(MemoryCardState state) {
        this.state = state;
    }

    public Long getMatchedByUserId() {
        return matchedByUserId;
    }

    public void setMatchedByUserId(Long matchedByUserId) {
        this.matchedByUserId = matchedByUserId;
    }

    /** Nội dung chỉ được gửi cho client khi thẻ đang mở hoặc đã ghép. */
    public boolean isContentVisible() {
        return state != MemoryCardState.HIDDEN;
    }
}
