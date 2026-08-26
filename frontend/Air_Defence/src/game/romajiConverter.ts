// ============================================================================
// ROMAJI TO HIRAGANA ENGINE FOR AIR DEFENCE TYPING SYSTEM
// Hỗ trợ đầy đủ: Hepburn chuẩn, Kunrei-shiki, Nihon-shiki, biến thể gõ và trường âm.
// ============================================================================

const ROMAJI_TABLE: Record<string, string> = {
  // Vowels
  a: "あ", i: "い", u: "う", e: "え", o: "お",

  // K
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",

  // S
  sa: "さ", shi: "し", si: "し", su: "す", se: "せ", so: "そ",
  sha: "しゃ", sya: "しゃ", shu: "しゅ", syu: "しゅ", sho: "しょ", syo: "しょ",

  // T
  ta: "た", chi: "ち", ti: "ち", tsu: "つ", tu: "つ", te: "て", to: "と",
  cha: "ちゃ", tya: "ちゃ", chu: "ちゅ", tyu: "ちゅ", cho: "ちょ", tyo: "ちょ",

  // N
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  nn: "ん", "n'": "ん",

  // H
  ha: "は", hi: "ひ", fu: "ふ", hu: "ふ", he: "へ", ho: "ほ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ", fa: "ふぁ", fi: "ふぃ", fe: "ふぇ", fo: "ふぉ",

  // M
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  mya: "みゃ", myu: "みゅ", myo: "みょ",

  // Y
  ya: "や", yu: "ゆ", yo: "よ",

  // R
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",

  // W
  wa: "わ", wo: "を",

  // G
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",

  // Z
  za: "ざ", ji: "じ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ja: "じゃ", zya: "じゃ", jya: "じゃ",
  ju: "じゅ", zyu: "じゅ", jyu: "じゅ",
  jo: "じょ", zyo: "じょ", jyo: "じょ",

  // D
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  dya: "ぢゃ", dyu: "ぢゅ", dyo: "ぢょ",

  // B
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",

  // P
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ"
};

/**
 * Chuẩn hóa các ký tự trường âm (macrons & circumflex) sang dạng chữ cái la-tinh thông dụng.
 * Ví dụ: ō -> ou, ū -> uu, ā -> aa, ē -> ei, ī -> ii
 */
export function normalizeMacrons(input: string): string[] {
  let str = input.toLowerCase().trim();
  const results: string[] = [str];

  // Thay thế macron / circumflex
  const hasMacron = /[āēīōūâêîôû]/.test(str);
  if (hasMacron) {
    const v1 = str
      .replace(/[āâ]/g, "aa")
      .replace(/[īî]/g, "ii")
      .replace(/[ūû]/g, "uu")
      .replace(/[ēê]/g, "ei")
      .replace(/[ōô]/g, "ou");
    results.push(v1);

    // Biến thể oo cho ō
    const v2 = str
      .replace(/[āâ]/g, "aa")
      .replace(/[īî]/g, "ii")
      .replace(/[ūû]/g, "uu")
      .replace(/[ēê]/g, "ee")
      .replace(/[ōô]/g, "oo");
    results.push(v2);

    // Biến thể đơn (o thay vì ou)
    const v3 = str
      .replace(/[āâ]/g, "a")
      .replace(/[īî]/g, "i")
      .replace(/[ūû]/g, "u")
      .replace(/[ēê]/g, "e")
      .replace(/[ōô]/g, "o");
    results.push(v3);
  }

  return Array.from(new Set(results));
}

/**
 * Chuyển đổi một chuỗi Romaji đơn sang Hiragana.
 */
export function convertSingleRomajiToHiragana(raw: string): string {
  let text = raw.toLowerCase().trim();
  let result = "";
  let i = 0;

  while (i < text.length) {
    // 1. Thử khớp 3 ký tự (ví dụ: kya, sha, tsu, chu, ryo, gya...)
    const sub3 = text.substring(i, i + 3);
    // 2. Thử khớp 2 ký tự (ví dụ: ka, si, ti, ta, tu, fu...)
    const sub2 = text.substring(i, i + 2);
    // 3. Thử khớp 1 ký tự (a, i, u, e, o, n)
    const sub1 = text.substring(i, i + 1);

    // Sokuon (っ) xử lý phụ âm kép (kk, ss, tt, pp, cc...)
    if (
      i + 1 < text.length &&
      text[i] === text[i + 1] &&
      !"aeiou n".includes(text[i])
    ) {
      result += "っ";
      i++;
      continue;
    }

    // Xử lý 'tch' -> 'っch'
    if (text.substring(i, i + 3) === "tch") {
      result += "っ";
      i++;
      continue;
    }

    if (ROMAJI_TABLE[sub3]) {
      result += ROMAJI_TABLE[sub3];
      i += 3;
    } else if (ROMAJI_TABLE[sub2]) {
      result += ROMAJI_TABLE[sub2];
      i += 2;
    } else if (ROMAJI_TABLE[sub1]) {
      result += ROMAJI_TABLE[sub1];
      i += 1;
    } else if (sub1 === "n") {
      // 'n' ở cuối từ hoặc trước phụ âm (không phải y hoặc nguyên âm)
      if (
        i === text.length - 1 ||
        (i + 1 < text.length && !"aeiouy".includes(text[i + 1]))
      ) {
        result += "ん";
        i++;
      } else {
        result += sub1;
        i++;
      }
    } else {
      // Giữ nguyên ký tự nếu không chuyển đổi được (dấu cách, ký tự đặc biệt...)
      result += sub1;
      i++;
    }
  }

  return result;
}

/**
 * Tạo danh sách tất cả các biến thể Hiragana có thể có từ chuỗi gõ Romaji.
 */
export function romajiToHiragana(input: string): string[] {
  const normalizedList = normalizeMacrons(input);
  const hiraganaSet = new Set<string>();

  normalizedList.forEach((text) => {
    // Chuyển đổi chính
    const hira = convertSingleRomajiToHiragana(text);
    hiraganaSet.add(hira);

    // Thử nghiệm thay thế 'ou' -> 'お' hoặc 'おお' nếu chưa khớp
    if (text.includes("ou")) {
      const alt = convertSingleRomajiToHiragana(text.replace(/ou/g, "oo"));
      hiraganaSet.add(alt);
    }
    // Thử nghiệm m trước b/p (ví dụ jumbi -> junbi)
    if (text.includes("mb") || text.includes("mp")) {
      const alt2 = convertSingleRomajiToHiragana(text.replace(/mb/g, "nb").replace(/mp/g, "np"));
      hiraganaSet.add(alt2);
    }
  });

  return Array.from(hiraganaSet);
}

/**
 * So khớp một chuỗi đầu vào (Romaji, Hiragana, Kanji, Meaning) với mục tiêu TargetWord.
 */
export function matchesTargetWord(target: { word: string; reading: string; meaning: string }, input: string): boolean {
  const raw = input.trim().toLowerCase();
  if (!raw) return false;

  const readingLower = target.reading.toLowerCase();
  const wordLower = target.word.toLowerCase();
  const meaningLower = target.meaning.toLowerCase();

  // 1. So khớp trực tiếp Hiragana, Kanji, hoặc Nghĩa
  if (raw === readingLower || raw === wordLower || raw === meaningLower) {
    return true;
  }

  // 2. Chuyển đổi Romaji sang Hiragana và so khớp với reading
  const hiraganaVariants = romajiToHiragana(raw);
  if (hiraganaVariants.some((h) => h === readingLower)) {
    return true;
  }

  return false;
}
