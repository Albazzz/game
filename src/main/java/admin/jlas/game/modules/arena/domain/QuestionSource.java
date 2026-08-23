package admin.jlas.game.modules.arena.domain;

/** Nguồn câu hỏi — sẽ map sang bảng vocabulary/kanji thật khi merge vào app J-LAS. */
public enum QuestionSource {
    GLOBAL_VOCABULARY,
    USER_LESSON,
    USER_DECK,
    KANJI_LIST,
    CUSTOM_DECK
}
