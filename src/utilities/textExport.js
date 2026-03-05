/**
 * Converts an array of objects to tab-delimited text format.
 *
 * @param {Array<Object>} rows - An array of objects to be converted to tab-delimited text.
 *                               Each object's keys become column headers and values become row data.
 * @returns {string} A tab-delimited string representation of the input data, with headers as the first line.
 *
 * @example
 * const data = [
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 }
 * ];
 * const result = toTabDelimitedText(data);
 * // Returns: "name\tage\nAlice\t30\nBob\t25"
 */
export function toTabDelimitedText(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (safeRows.length === 0) return '';

  const header = [];
  const headerSet = new Set();

  for (const row of safeRows) {
    const keys = Object.keys(row || {});
    for (const key of keys) {
      if (!headerSet.has(key)) {
        headerSet.add(key);
        header.push(key);
      }
    }
  }

  if (header.length === 0) return '';

  const escape = (v) => {
    if (v == null) return '';
    if (typeof v === 'string') {
      return v.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
    }
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const lines = [header.join('\t')];
  for (const row of safeRows) {
    lines.push(header.map((k) => escape(row?.[k])).join('\t'));
  }

  return lines.join('\n');
}
