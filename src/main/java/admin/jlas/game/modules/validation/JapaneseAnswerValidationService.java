package admin.jlas.game.modules.validation;

import admin.jlas.game.modules.arena.domain.AnswerMode;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Pipeline deterministic dùng chung cho mọi game có câu trả lời nhập tay.
 * Không gọi mạng/AI trong đường competitive: NFKC -> alias exact -> fuzzy bảo thủ.
 */
@Service
public class JapaneseAnswerValidationService {

    public enum MatchKind {
        EXACT,
        APPROVED_ALIAS,
        CONSERVATIVE_FUZZY,
        NO_MATCH
    }

    public record ValidationResult(boolean correct, MatchKind matchKind,
                                   String normalizedInput) {
    }

    public ValidationResult validate(String submitted, String expected,
                                     List<String> aliases, AnswerMode mode) {
        boolean readingMode = mode == AnswerMode.KANJI_TO_HIRAGANA;
        String input = normalize(submitted, readingMode);
        String primary = normalize(expected, readingMode);
        if (input.isBlank()) {
            return new ValidationResult(false, MatchKind.NO_MATCH, input);
        }
        if (input.equals(primary)) {
            return new ValidationResult(true, MatchKind.EXACT, input);
        }

        Set<String> approved = new LinkedHashSet<>();
        if (aliases != null) {
            aliases.stream()
                    .map(alias -> normalize(alias, readingMode))
                    .filter(alias -> !alias.isBlank())
                    .forEach(approved::add);
        }
        if (approved.contains(input)) {
            return new ValidationResult(true, MatchKind.APPROVED_ALIAS, input);
        }

        // Cách đọc tiếng Nhật phải exact sau kana-normalization. Với nghĩa dài,
        // chỉ tha tối đa một ký tự để tránh biến mọi typo thành đáp án đúng.
        if (!readingMode && input.length() >= 5) {
            boolean close = distanceAtMostOne(input, primary)
                    || approved.stream().anyMatch(alias -> distanceAtMostOne(input, alias));
            if (close) {
                return new ValidationResult(true, MatchKind.CONSERVATIVE_FUZZY, input);
            }
        }
        return new ValidationResult(false, MatchKind.NO_MATCH, input);
    }

    public String normalize(String value, boolean kanaToHiragana) {
        if (value == null) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFKC)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[。、「」『』！？!?.,;:]+", " ")
                .replaceAll("[\\p{Z}\\s]+", " ")
                .trim();
        return kanaToHiragana ? katakanaToHiragana(normalized) : normalized;
    }

    private String katakanaToHiragana(String value) {
        StringBuilder result = new StringBuilder(value.length());
        for (int index = 0; index < value.length(); index++) {
            char current = value.charAt(index);
            if (current >= '\u30A1' && current <= '\u30F6') {
                result.append((char) (current - 0x60));
            } else {
                result.append(current);
            }
        }
        return result.toString();
    }

    private boolean distanceAtMostOne(String left, String right) {
        if (Math.abs(left.length() - right.length()) > 1) {
            return false;
        }
        int i = 0;
        int j = 0;
        int edits = 0;
        while (i < left.length() && j < right.length()) {
            if (left.charAt(i) == right.charAt(j)) {
                i++;
                j++;
                continue;
            }
            if (++edits > 1) {
                return false;
            }
            if (left.length() > right.length()) {
                i++;
            } else if (right.length() > left.length()) {
                j++;
            } else {
                i++;
                j++;
            }
        }
        if (i < left.length() || j < right.length()) {
            edits++;
        }
        return edits <= 1;
    }
}
