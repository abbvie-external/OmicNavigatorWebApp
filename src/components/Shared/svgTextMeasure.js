/**
 * Lightweight text measurement helpers for SVG sizing.
 * Uses a cached <canvas> context to measure text widths, matching the rendered font.
 *
 * NOTE: Pure utility (no React state, no DOM mutations beyond an in-memory canvas),
 * so it cannot trigger render loops.
 */

let _canvasCtx = null;

function getCanvasContext() {
  if (_canvasCtx) return _canvasCtx;

  // Guard for non-browser environments (tests/SSR). Fallback to null.
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  _canvasCtx = canvas.getContext('2d');
  return _canvasCtx;
}

/**
 * Measure the width (in px) of a string with a given CSS font shorthand.
 * Returns a conservative estimate if canvas is unavailable.
 */
export function measureTextWidth(text, font) {
  const safeText = text == null ? '' : String(text);
  const ctx = getCanvasContext();

  // Conservative fallback: ~8px per character for typical UI fonts at 14px.
  if (!ctx) return Math.ceil(safeText.length * 8);

  ctx.font = font;
  return Math.ceil(ctx.measureText(safeText).width);
}

/**
 * Compute max width of a list of lines. Each entry can be:
 * - string, measured with `defaultFont`
 * - { text, font } to measure with a specific font
 */
export function maxLinesWidth(lines, defaultFont) {
  if (!Array.isArray(lines) || lines.length === 0) return 0;

  let maxW = 0;
  for (const line of lines) {
    if (line == null) continue;

    const text = typeof line === 'string' ? line : line.text;
    const font = typeof line === 'string' ? defaultFont : line.font || defaultFont;

    const w = measureTextWidth(text, font);
    if (w > maxW) maxW = w;
  }
  return maxW;
}
