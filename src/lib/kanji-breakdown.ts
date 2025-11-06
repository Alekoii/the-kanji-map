import kanjilist from "@/../data/kanjilist.json";

interface KanjiData {
  k: string;  // kanji character
  r: string;  // reading (kunyomi)
  m: string;  // meaning
  g: number;  // grade (1 = jōyō, 2 = jinmeiyō, 3 = other)
  j: string | null;  // JLPT level
  s: number | null;  // stroke count
}

/**
 * Checks if a character is a kanji
 */
export function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  // Common CJK Unified Ideographs: U+4E00 to U+9FFF
  // CJK Unified Ideographs Extension A: U+3400 to U+4DBF
  // CJK Compatibility Ideographs: U+F900 to U+FAFF
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff)
  );
}

/**
 * Extracts all kanji characters from a string
 */
export function extractKanji(text: string): string[] {
  return Array.from(text).filter(isKanji);
}

/**
 * Looks up kanji data from the kanjilist
 */
export function getKanjiData(kanji: string): KanjiData | undefined {
  const data = kanjilist as KanjiData[];
  return data.find((item) => item.k === kanji);
}

/**
 * Gets breakdown data for all kanji in a vocab word
 */
export function getVocabKanjiBreakdown(expression: string): Array<{
  kanji: string;
  meaning: string;
  reading: string;
  jlptLevel: string | null;
}> {
  const kanjiChars = extractKanji(expression);
  const uniqueKanji = Array.from(new Set(kanjiChars)); // Remove duplicates

  return uniqueKanji.map((kanji) => {
    const data = getKanjiData(kanji);
    return {
      kanji,
      meaning: data?.m || "Unknown",
      reading: data?.r || "",
      jlptLevel: data?.j || null,
    };
  }).filter((item) => item.meaning !== ""); // Filter out kanji with no meaning
}
