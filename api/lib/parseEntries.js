/**
 * AI応答テキストから仕訳 entries を抽出（クライアント・サーバー共通ロジック）
 */

export function parseEntriesFromAI(text) {
  if (!text?.trim()) throw new Error('AIの応答が空です');

  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  const extract = (raw) => {
    const p = JSON.parse(raw);
    if (p?.entries?.length) return p.entries;
    if (Array.isArray(p) && p.length) return p;
    throw new Error('no entries');
  };

  try {
    return extract(cleaned);
  } catch {
    /* next */
  }

  const block = cleaned.match(/\{[\s\S]*"entries"\s*:\s*\[[\s\S]*\]\s*\}/);
  if (block) {
    try {
      return extract(block[0]);
    } catch {
      /* next */
    }
  }

  const s = cleaned.indexOf('{');
  const e = cleaned.lastIndexOf('}');
  if (s >= 0 && e > s) {
    try {
      return extract(cleaned.slice(s, e + 1));
    } catch {
      /* next */
    }
  }

  throw new Error('AIの応答をJSONとして読み取れませんでした');
}

export function extractTextFromAnthropic(data) {
  if (!data?.content?.length) return '';
  return data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}
